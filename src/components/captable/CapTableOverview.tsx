import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PieChart, Users, Layers, DollarSign, TrendingUp, Percent } from "lucide-react";

interface CapTableOverviewProps {
  entityId?: string;
  shareClasses: any[];
  shareholders: any[];
  transactions: any[];
  entities: any[];
}

const CapTableOverview = ({ entityId, shareClasses, shareholders, transactions, entities }: CapTableOverviewProps) => {
  // Calculate ownership data
  const ownershipData = useMemo(() => {
    // Group transactions by shareholder and share class
    const holdings: Record<string, Record<string, number>> = {};
    
    transactions.forEach((tx) => {
      if (!holdings[tx.shareholder_id]) {
        holdings[tx.shareholder_id] = {};
      }
      if (!holdings[tx.shareholder_id][tx.share_class_id]) {
        holdings[tx.shareholder_id][tx.share_class_id] = 0;
      }
      
      // Add or subtract based on transaction type
      if (["issuance", "exercise"].includes(tx.transaction_type)) {
        holdings[tx.shareholder_id][tx.share_class_id] += tx.shares;
      } else if (["repurchase", "cancellation"].includes(tx.transaction_type)) {
        holdings[tx.shareholder_id][tx.share_class_id] -= tx.shares;
      }
    });

    return holdings;
  }, [transactions]);

  // Calculate totals
  const stats = useMemo(() => {
    let totalShares = 0;
    let totalAuthorized = 0;
    let totalInvestment = 0;
    
    // Sum authorized shares from share classes
    shareClasses.forEach((sc) => {
      totalAuthorized += sc.authorized_shares;
    });
    
    // Sum issued shares and investment from transactions
    transactions.forEach((tx) => {
      if (["issuance", "exercise"].includes(tx.transaction_type)) {
        totalShares += tx.shares;
        totalInvestment += tx.total_amount;
      } else if (["repurchase", "cancellation"].includes(tx.transaction_type)) {
        totalShares -= tx.shares;
      }
    });

    return {
      totalShares,
      totalAuthorized,
      totalInvestment,
      shareholderCount: shareholders.length,
      shareClassCount: shareClasses.length,
    };
  }, [shareClasses, shareholders, transactions]);

  // Calculate shareholder ownership
  const shareholderOwnership = useMemo(() => {
    return shareholders.map((sh) => {
      let totalShares = 0;
      const holdings = ownershipData[sh.id] || {};
      
      Object.values(holdings).forEach((shares) => {
        totalShares += shares;
      });

      const percentage = stats.totalShares > 0 ? (totalShares / stats.totalShares) * 100 : 0;
      
      return {
        ...sh,
        shares: totalShares,
        percentage,
      };
    }).filter(sh => sh.shares > 0).sort((a, b) => b.shares - a.shares);
  }, [shareholders, ownershipData, stats.totalShares]);

  const getEntityName = (id: string) => entities.find(e => e.id === id)?.name || "Unknown";

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Shares Issued</CardTitle>
            <TrendingUp className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalShares.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">of {stats.totalAuthorized.toLocaleString()} authorized</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Investment</CardTitle>
            <DollarSign className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">${stats.totalInvestment.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">across all transactions</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Shareholders</CardTitle>
            <Users className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.shareholderCount}</div>
            <p className="text-xs text-muted-foreground">registered shareholders</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Share Classes</CardTitle>
            <Layers className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.shareClassCount}</div>
            <p className="text-xs text-muted-foreground">defined classes</p>
          </CardContent>
        </Card>
      </div>

      {/* Ownership Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Ownership Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          {shareholderOwnership.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-foreground">Shareholder</TableHead>
                  <TableHead className="text-foreground">Type</TableHead>
                  <TableHead className="text-foreground">Entity</TableHead>
                  <TableHead className="text-foreground text-right">Shares</TableHead>
                  <TableHead className="text-foreground text-right">Ownership %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shareholderOwnership.map((sh) => (
                  <TableRow key={sh.id}>
                    <TableCell className="font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        {sh.name}
                        {sh.is_founder && <Badge variant="default" className="text-xs">Founder</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{sh.shareholder_type}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{getEntityName(sh.entity_id)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{sh.shares.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ width: `${Math.min(sh.percentage, 100)}%` }}
                          />
                        </div>
                        <span className="text-foreground font-medium w-16 text-right">
                          {sh.percentage.toFixed(2)}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <PieChart className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No ownership data yet</p>
              <p className="text-sm">Add shareholders and record transactions to see the cap table</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Share Classes Summary */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Share Classes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {shareClasses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shareClasses.map((sc) => {
                // Calculate issued shares for this class
                const issued = transactions
                  .filter(tx => tx.share_class_id === sc.id)
                  .reduce((sum, tx) => {
                    if (["issuance", "exercise"].includes(tx.transaction_type)) return sum + tx.shares;
                    if (["repurchase", "cancellation"].includes(tx.transaction_type)) return sum - tx.shares;
                    return sum;
                  }, 0);
                const available = sc.authorized_shares - issued;
                const issuedPercent = (issued / sc.authorized_shares) * 100;

                return (
                  <div key={sc.id} className="p-4 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-foreground">{sc.name}</h4>
                      <Badge variant={sc.class_type === "preferred" ? "default" : "secondary"}>
                        {sc.class_type}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Authorized:</span>
                        <span className="text-foreground">{sc.authorized_shares.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Issued:</span>
                        <span className="text-foreground">{issued.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Available:</span>
                        <span className="text-green-500">{available.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-2">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: `${Math.min(issuedPercent, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Layers className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No share classes defined</p>
              <p className="text-sm">Create share classes to structure your equity</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CapTableOverview;
