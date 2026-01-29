import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface DNSRecord {
  type: string;
  name: string;
  content: string;
  ttl: number;
  proxied?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the domain from request body
    const { domain } = await req.json();
    if (!domain) {
      return new Response(
        JSON.stringify({ error: 'Domain is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Cloudflare API token
    const cloudflareApiToken = Deno.env.get('CLOUDFLARE_API_TOKEN');
    if (!cloudflareApiToken) {
      return new Response(
        JSON.stringify({ error: 'Cloudflare API token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract root domain from URL
    let rootDomain = domain;
    try {
      // Handle full URLs
      if (domain.includes('://')) {
        const url = new URL(domain);
        rootDomain = url.hostname;
      }
      // Remove www prefix if present
      rootDomain = rootDomain.replace(/^www\./, '');
      // Get the root domain (last two parts for most TLDs)
      const parts = rootDomain.split('.');
      if (parts.length > 2) {
        // Handle common 2-part TLDs like .co.uk
        const commonTwoPartTlds = ['co.uk', 'com.au', 'co.nz', 'co.za', 'com.br'];
        const lastTwo = parts.slice(-2).join('.');
        if (commonTwoPartTlds.includes(lastTwo)) {
          rootDomain = parts.slice(-3).join('.');
        } else {
          rootDomain = parts.slice(-2).join('.');
        }
      }
    } catch {
      // If URL parsing fails, use the domain as-is
      console.log('Could not parse URL, using domain as-is:', domain);
    }

    console.log(`Fetching DNS records for domain: ${rootDomain}`);

    // First, get the zone ID for the domain
    const zonesResponse = await fetch(
      `https://api.cloudflare.com/client/v4/zones?name=${rootDomain}`,
      {
        headers: {
          'Authorization': `Bearer ${cloudflareApiToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const zonesData = await zonesResponse.json();
    
    if (!zonesData.success || !zonesData.result || zonesData.result.length === 0) {
      console.log('Zone not found in Cloudflare:', zonesData);
      return new Response(
        JSON.stringify({ 
          error: 'Domain not found in Cloudflare',
          details: 'This domain is not managed by your Cloudflare account',
          records: []
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const zone = zonesData.result[0];
    const zoneId = zone.id;
    const zoneName = zone.name;
    
    // Extract domain expiry from zone data if available (registrar info)
    let domainExpiryDate: string | null = null;
    
    console.log(`Found zone ID: ${zoneId} for ${zoneName}`);

    // Try to get registrar/domain expiry info
    try {
      const registrarResponse = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${zoneId}`,
        {
          headers: {
            'Authorization': `Bearer ${cloudflareApiToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      const registrarData = await registrarResponse.json();
      if (registrarData.success && registrarData.result) {
        // Check for domain expiry in various possible fields
        const result = registrarData.result;
        if (result.meta?.registry_expiry) {
          domainExpiryDate = result.meta.registry_expiry.split('T')[0];
        }
      }
    } catch (regError) {
      console.log('Could not fetch registrar info:', regError);
    }

    // Also try the registrar domains endpoint if domain is registered through Cloudflare
    if (!domainExpiryDate) {
      try {
        // Get account ID first
        const accountsResponse = await fetch(
          'https://api.cloudflare.com/client/v4/accounts?page=1&per_page=1',
          {
            headers: {
              'Authorization': `Bearer ${cloudflareApiToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
        
        const accountsData = await accountsResponse.json();
        if (accountsData.success && accountsData.result?.[0]?.id) {
          const accountId = accountsData.result[0].id;
          
          // Try to get domain registration info
          const domainsResponse = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${accountId}/registrar/domains/${rootDomain}`,
            {
              headers: {
                'Authorization': `Bearer ${cloudflareApiToken}`,
                'Content-Type': 'application/json',
              },
            }
          );
          
          const domainsData = await domainsResponse.json();
          if (domainsData.success && domainsData.result?.expires_at) {
            domainExpiryDate = domainsData.result.expires_at.split('T')[0];
            console.log(`Found domain expiry: ${domainExpiryDate}`);
          }
        }
      } catch (domainError) {
        console.log('Could not fetch domain registration info:', domainError);
      }
    }

    // Fetch A and CNAME records for the zone
    const dnsResponse = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?type=A,CNAME&per_page=100`,
      {
        headers: {
          'Authorization': `Bearer ${cloudflareApiToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const dnsData = await dnsResponse.json();
    
    if (!dnsData.success) {
      console.error('Failed to fetch DNS records:', dnsData);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch DNS records', details: dnsData.errors }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format the DNS records
    const records: DNSRecord[] = dnsData.result.map((record: any) => ({
      type: record.type,
      name: record.name,
      content: record.content,
      ttl: record.ttl,
      proxied: record.proxied,
    }));

    console.log(`Found ${records.length} DNS records`);

    return new Response(
      JSON.stringify({ 
        success: true,
        domain: zoneName,
        domain_expiry_date: domainExpiryDate,
        records 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error fetching Cloudflare DNS:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
