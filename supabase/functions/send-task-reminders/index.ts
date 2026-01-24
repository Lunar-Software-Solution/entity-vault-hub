import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TaskWithDetails {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  priority: string;
  assigned_to: string | null;
  entity: { name: string } | null;
  filing: { title: string } | null;
}

interface UserProfile {
  user_id: string;
  full_name: string | null;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const brevoApiKey = Deno.env.get("BREVO_API_KEY");
    if (!brevoApiKey) {
      console.error("BREVO_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get optional parameters from request body
    let reminderDays = 7;
    try {
      const body = await req.json();
      if (body.reminderDays) reminderDays = body.reminderDays;
    } catch {
      // Use defaults if no body
    }

    const today = new Date();
    const reminderDate = new Date(today);
    reminderDate.setDate(today.getDate() + reminderDays);

    console.log(`Fetching tasks due between ${today.toISOString().split('T')[0]} and ${reminderDate.toISOString().split('T')[0]}`);

    // Fetch upcoming tasks that are pending or in_progress
    const { data: tasks, error: tasksError } = await supabase
      .from("filing_tasks")
      .select(`
        id,
        title,
        description,
        due_date,
        priority,
        assigned_to,
        entity:entities(name),
        filing:entity_filings(title)
      `)
      .in("status", ["pending", "in_progress"])
      .gte("due_date", today.toISOString().split('T')[0])
      .lte("due_date", reminderDate.toISOString().split('T')[0])
      .order("due_date", { ascending: true });

    if (tasksError) {
      console.error("Error fetching tasks:", tasksError);
      throw tasksError;
    }

    if (!tasks || tasks.length === 0) {
      console.log("No upcoming tasks found");
      return new Response(JSON.stringify({ success: true, message: "No upcoming tasks", emailsSent: 0 }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Found ${tasks.length} upcoming tasks`);

    // Get all admin users to send reminders to
    const { data: adminRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (rolesError) {
      console.error("Error fetching admin roles:", rolesError);
      throw rolesError;
    }

    const adminUserIds = adminRoles?.map(r => r.user_id) || [];

    // Get user emails from auth.users
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error("Error fetching users:", usersError);
      throw usersError;
    }

    // Get user profiles for names
    const { data: profiles } = await supabase
      .from("user_profiles")
      .select("user_id, full_name");

    const profileMap = new Map<string, string>();
    profiles?.forEach((p: UserProfile) => {
      profileMap.set(p.user_id, p.full_name || "User");
    });

    // Filter to admin users with emails
    const adminUsers = users
      .filter(u => adminUserIds.includes(u.id) && u.email)
      .map(u => ({
        id: u.id,
        email: u.email!,
        name: profileMap.get(u.id) || u.email!.split('@')[0],
      }));

    if (adminUsers.length === 0) {
      console.log("No admin users with emails found");
      return new Response(JSON.stringify({ success: true, message: "No admin users to notify", emailsSent: 0 }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Group tasks by assigned user, or send all to admins if unassigned
    const tasksByUser = new Map<string, typeof tasks>();
    
    for (const task of tasks) {
      if (task.assigned_to && adminUserIds.includes(task.assigned_to)) {
        const existing = tasksByUser.get(task.assigned_to) || [];
        existing.push(task);
        tasksByUser.set(task.assigned_to, existing);
      } else {
        // Unassigned tasks go to all admins
        for (const admin of adminUsers) {
          const existing = tasksByUser.get(admin.id) || [];
          if (!existing.some(t => t.id === task.id)) {
            existing.push(task);
            tasksByUser.set(admin.id, existing);
          }
        }
      }
    }

    let emailsSent = 0;
    const errors: string[] = [];

    // Send emails to each user with their tasks
    for (const [userId, userTasks] of tasksByUser) {
      const user = adminUsers.find(u => u.id === userId);
      if (!user || userTasks.length === 0) continue;

      const taskRows = userTasks.map(task => {
        const dueDate = new Date(task.due_date);
        const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const urgencyColor = daysUntil <= 2 ? "#dc2626" : daysUntil <= 5 ? "#f59e0b" : "#0d9488";
        const priorityBadge = task.priority === "urgent" ? "🔴" : task.priority === "high" ? "🟠" : task.priority === "medium" ? "🟡" : "🟢";
        
        return `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
              ${priorityBadge} ${task.title}
              ${task.entity?.name ? `<br><span style="font-size: 12px; color: #666;">${task.entity.name}</span>` : ""}
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
              <span style="color: ${urgencyColor}; font-weight: 600;">${dueDate.toLocaleDateString()}</span>
              <br><span style="font-size: 11px; color: #888;">${daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `${daysUntil} days`}</span>
            </td>
          </tr>
        `;
      }).join("");

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">📋 Upcoming Tasks Reminder</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
            <p style="font-size: 16px; margin-bottom: 20px;">
              Hi <strong>${user.name}</strong>,
            </p>
            <p style="font-size: 14px; color: #666; margin-bottom: 25px;">
              You have <strong>${userTasks.length} task${userTasks.length > 1 ? "s" : ""}</strong> due in the next ${reminderDays} days:
            </p>
            <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <thead>
                <tr style="background: #1a1a2e; color: white;">
                  <th style="padding: 12px; text-align: left;">Task</th>
                  <th style="padding: 12px; text-align: center;">Due Date</th>
                </tr>
              </thead>
              <tbody>
                ${taskRows}
              </tbody>
            </table>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://entity-vault-hub.lovable.app" style="background: #0d9488; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
                View All Tasks
              </a>
            </div>
            <p style="font-size: 12px; color: #999; margin-top: 30px; text-align: center;">
              This is an automated reminder from Entity Hub.
            </p>
          </div>
        </body>
        </html>
      `;

      try {
        const emailResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "api-key": brevoApiKey,
          },
          body: JSON.stringify({
            sender: {
              name: "Entity Hub",
              email: "noreply@braxtech.com",
            },
            to: [{ email: user.email, name: user.name }],
            subject: `📋 ${userTasks.length} upcoming task${userTasks.length > 1 ? "s" : ""} due soon`,
            htmlContent: emailHtml,
          }),
        });

        if (!emailResponse.ok) {
          const errorData = await emailResponse.text();
          console.error(`Failed to send email to ${user.email}:`, errorData);
          errors.push(`${user.email}: ${errorData}`);
        } else {
          console.log(`Email sent successfully to ${user.email}`);
          emailsSent++;
        }
      } catch (emailError: any) {
        console.error(`Error sending email to ${user.email}:`, emailError);
        errors.push(`${user.email}: ${emailError.message}`);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      emailsSent, 
      tasksFound: tasks.length,
      errors: errors.length > 0 ? errors : undefined 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in send-task-reminders function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
