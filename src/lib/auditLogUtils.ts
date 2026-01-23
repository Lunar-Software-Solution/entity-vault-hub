// Utility functions for formatting audit log entries

import type { Json } from "@/integrations/supabase/types";

// Type guard to check if value is a record object
const isRecord = (value: Json | null | undefined): value is Record<string, any> => {
  return value !== null && value !== undefined && typeof value === 'object' && !Array.isArray(value);
};

// Fields to ignore when computing changes (metadata/timestamps)
const IGNORED_FIELDS = ['id', 'created_at', 'updated_at', 'user_id'];

// Fields that should be masked for privacy
const SENSITIVE_FIELDS = ['account_number', 'card_number', 'security_code', 'iban', 'swift_bic', 'routing_number', 'passport_number', 'tax_id'];

// Format table names nicely
export const formatTableName = (tableName: string): string => {
  return tableName
    .replace(/_/g, " ")
    .replace(/\b\w/g, l => l.toUpperCase())
    .replace("Entity ", "")
    .replace(" Ubos", "/UBOs");
};

// Get a friendly name for the record from new_values or old_values
export const getRecordName = (values: Json | null | undefined): string | null => {
  if (!isRecord(values)) return null;
  
  // Try common name fields in order of priority
  const nameFields = ['name', 'title', 'full_name', 'label', 'email', 'bank', 'card_number'];
  
  for (const field of nameFields) {
    if (values[field]) {
      // Mask card numbers
      if (field === 'card_number') {
        const num = String(values[field]).replace(/\s/g, '');
        return `****${num.slice(-4)}`;
      }
      return String(values[field]);
    }
  }
  
  return null;
};

// Mask sensitive field values
const maskSensitiveValue = (field: string, value: any): string => {
  if (SENSITIVE_FIELDS.includes(field) && value) {
    const str = String(value).replace(/\s/g, '');
    if (str.length > 4) {
      return `****${str.slice(-4)}`;
    }
  }
  return String(value);
};

// Format a field name for display
const formatFieldName = (field: string): string => {
  return field
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .replace('Id', 'ID')
    .replace('Url', 'URL')
    .replace('Iban', 'IBAN')
    .replace('Bic', 'BIC');
};

// Compare old and new values to get meaningful changes
export interface FieldChange {
  field: string;
  fieldLabel: string;
  oldValue: string | null;
  newValue: string | null;
}

export const getChangedFields = (
  oldValues: Json | null | undefined,
  newValues: Json | null | undefined
): FieldChange[] => {
  if (!isRecord(oldValues) || !isRecord(newValues)) return [];
  
  const changes: FieldChange[] = [];
  
  // Get all keys from both objects
  const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)]);
  
  for (const key of allKeys) {
    // Skip ignored fields
    if (IGNORED_FIELDS.includes(key)) continue;
    
    const oldVal = oldValues[key];
    const newVal = newValues[key];
    
    // Check if values are different
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      changes.push({
        field: key,
        fieldLabel: formatFieldName(key),
        oldValue: oldVal !== null && oldVal !== undefined ? maskSensitiveValue(key, oldVal) : null,
        newValue: newVal !== null && newVal !== undefined ? maskSensitiveValue(key, newVal) : null,
      });
    }
  }
  
  return changes;
};

// Get a summary description of the change
export const getChangeSummary = (
  action: string,
  tableName: string | null,
  oldValues: Json | null | undefined,
  newValues: Json | null | undefined
): string => {
  const recordName = getRecordName(newValues) || getRecordName(oldValues);
  const formattedTable = formatTableName(tableName || 'record');
  
  if (action === 'INSERT') {
    return recordName 
      ? `Created ${formattedTable}: "${recordName}"`
      : `Created new ${formattedTable}`;
  }
  
  if (action === 'DELETE') {
    return recordName
      ? `Deleted ${formattedTable}: "${recordName}"`
      : `Deleted ${formattedTable}`;
  }
  
  if (action === 'UPDATE') {
    const changes = getChangedFields(oldValues, newValues);
    
    if (changes.length === 0) {
      return recordName
        ? `Updated ${formattedTable}: "${recordName}"`
        : `Updated ${formattedTable}`;
    }
    
    if (changes.length === 1) {
      const change = changes[0];
      if (recordName) {
        return `Updated ${change.fieldLabel} for "${recordName}"`;
      }
      return `Updated ${change.fieldLabel} in ${formattedTable}`;
    }
    
    // Multiple changes
    const fieldNames = changes.slice(0, 3).map(c => c.fieldLabel).join(', ');
    const suffix = changes.length > 3 ? ` +${changes.length - 3} more` : '';
    
    if (recordName) {
      return `Updated ${fieldNames}${suffix} for "${recordName}"`;
    }
    return `Updated ${fieldNames}${suffix} in ${formattedTable}`;
  }
  
  return `${action} on ${formattedTable}`;
};

// Get a compact change summary for dashboard
export const getCompactChangeSummary = (
  action: string,
  tableName: string | null,
  oldValues: Json | null | undefined,
  newValues: Json | null | undefined
): { title: string; detail: string | null } => {
  const recordName = getRecordName(newValues) || getRecordName(oldValues);
  const formattedTable = formatTableName(tableName || 'record');
  
  const actionWord = action === 'INSERT' ? 'Created' : action === 'UPDATE' ? 'Updated' : 'Deleted';
  
  if (action === 'UPDATE' && oldValues && newValues) {
    const changes = getChangedFields(oldValues, newValues);
    if (changes.length > 0) {
      const fieldNames = changes.slice(0, 2).map(c => c.fieldLabel).join(', ');
      const suffix = changes.length > 2 ? ` +${changes.length - 2}` : '';
      return {
        title: recordName ? `${actionWord} "${recordName}"` : `${actionWord} ${formattedTable}`,
        detail: `Changed: ${fieldNames}${suffix}`,
      };
    }
  }
  
  return {
    title: recordName ? `${actionWord} "${recordName}"` : `${actionWord} ${formattedTable}`,
    detail: recordName ? formattedTable : null,
  };
};
