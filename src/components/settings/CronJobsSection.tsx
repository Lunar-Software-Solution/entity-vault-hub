import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Clock, Play, Pause, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";

interface CronJob {
  jobid: number;
  jobname: string;
  schedule: string;
  active: boolean;
  command: string;
}

const CronJobsSection = () => {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { canWrite } = useUserRole();

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke("list-cron-jobs");
      
      if (error) {
        throw error;
      }
      
      if (data?.error) {
        setError(data.error);
        setJobs([]);
      } else {
        setJobs(data?.jobs || []);
      }
    } catch (err) {
      console.error("Error fetching cron jobs:", err);
      setError("Failed to fetch cron jobs");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleToggle = async (job: CronJob) => {
    if (!canWrite) return;
    
    setToggling(job.jobid);
    try {
      const { data, error } = await supabase.functions.invoke("toggle-cron-job", {
        body: { jobId: job.jobid, active: !job.active },
      });
      
      if (error || data?.error) {
        throw new Error(data?.error || error?.message || "Failed to toggle job");
      }
      
      setJobs((prev) =>
        prev.map((j) =>
          j.jobid === job.jobid ? { ...j, active: !job.active } : j
        )
      );
      
      toast({
        title: job.active ? "Job paused" : "Job activated",
        description: `${job.jobname} has been ${job.active ? "paused" : "activated"}`,
      });
    } catch (err) {
      console.error("Error toggling job:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to toggle job",
        variant: "destructive",
      });
    } finally {
      setToggling(null);
    }
  };

  const parseSchedule = (schedule: string): string => {
    // Simple cron expression parser for common patterns
    const parts = schedule.split(" ");
    if (parts.length !== 5) return schedule;
    
    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
    
    // Daily at specific time
    if (dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
      if (minute === "0" && hour !== "*") {
        return `Daily at ${hour.padStart(2, "0")}:00 UTC`;
      }
      if (hour !== "*") {
        return `Daily at ${hour.padStart(2, "0")}:${minute.padStart(2, "0")} UTC`;
      }
    }
    
    // Hourly
    if (hour === "*" && dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
      if (minute === "0") return "Hourly";
      return `Every hour at minute ${minute}`;
    }
    
    // Every minute
    if (schedule === "* * * * *") return "Every minute";
    
    return schedule;
  };

  const getCommandDescription = (command: string): string => {
    if (command.includes("reset_recurring_filings")) {
      return "Resets filed recurring filings to pending status and advances due dates";
    }
    if (command.includes("send-task-reminders")) {
      return "Sends email reminders for upcoming filing tasks";
    }
    if (command.includes("cleanup_expired")) {
      return "Cleans up expired records from the database";
    }
    return command.length > 80 ? command.substring(0, 80) + "..." : command;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg">Scheduled Jobs</CardTitle>
          <CardDescription>
            View and manage automated background tasks
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={fetchJobs} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="flex items-center gap-2 p-4 mb-4 rounded-lg bg-destructive/10 text-destructive">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        {jobs.length === 0 && !error ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No scheduled jobs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Status</TableHead>
                  <TableHead>Job Name</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  {canWrite && <TableHead className="w-[100px] text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.jobid}>
                    <TableCell>
                      {job.active ? (
                        <Badge variant="default" className="gap-1 bg-green-600 hover:bg-green-700">
                          <CheckCircle2 className="w-3 h-3" />
                          <span className="hidden sm:inline">Active</span>
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <Pause className="w-3 h-3" />
                          <span className="hidden sm:inline">Paused</span>
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{job.jobname}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{parseSchedule(job.schedule)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                      {getCommandDescription(job.command)}
                    </TableCell>
                    {canWrite && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Switch
                            checked={job.active}
                            disabled={toggling === job.jobid}
                            onCheckedChange={() => handleToggle(job)}
                          />
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Cron jobs are scheduled tasks that run automatically at specified intervals.
            Disabling a job will prevent it from executing until re-enabled.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CronJobsSection;
