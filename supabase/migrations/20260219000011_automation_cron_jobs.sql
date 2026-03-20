-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 1. Daily 7AM Compliance Reminder
-- For Trips where status = 'Live', send reminder to captain
SELECT cron.schedule('daily_compliance_reminder', '0 7 * * *', $$
    INSERT INTO public.notifications (user_id, role_target, title, message, type, link)
    SELECT 
        captain_id,
        'captain',
        'Morning Compliance Check',
        'Please submit your morning daily logs for ' || destination,
        'Action_Required',
        '/trips/' || id
    FROM public.trips
    WHERE status = 'Live' AND captain_id IS NOT NULL;
    
    INSERT INTO public.system_logs (log_level, source, message) 
    VALUES ('INFO', 'cron:daily_compliance', 'Compliance reminders sent.');
$$);

-- 2. Trip End Automation
-- Automatically mark trips as 'Completed' if end_date has passed
SELECT cron.schedule('trip_end_automation', '0 0 * * *', $$
    WITH completed_trips AS (
        UPDATE public.trips
        SET status = 'Completed'
        WHERE status = 'Live' AND end_date < NOW()
        RETURNING id, captain_id, destination
    )
    INSERT INTO public.notifications (user_id, role_target, title, message, type)
    SELECT 
        captain_id,
        'captain',
        'Trip Completed',
        'Trip to ' || destination || ' has ended. Please submit final feedback.',
        'Action_Required'
    FROM completed_trips;

    -- Also trigger profit recalculation logic here if needed (handled by trigger on update)
    
    INSERT INTO public.system_logs (log_level, source, message) 
    VALUES ('INFO', 'cron:trip_end', 'Trip end automation ran.');
$$);

-- 3. Weekly Performance Summary (Monday 9AM)
-- Triggers an Edge Function (via HTTP) or inserts a high-level notification for now
SELECT cron.schedule('weekly_performance_summary', '0 9 * * 1', $$
   INSERT INTO public.notifications (role_target, title, message, type, link)
   VALUES (
       'admin',
       'Weekly Performance Report Ready',
       'Your weekly summary of Captains, Risks, and Profit is ready.',
       'Info',
       '/reports'
   );
   -- In real production, this would call an Edge Function to generate email
   -- SELECT net.http_post('https://project-ref.supabase.co/functions/v1/weekly-report');
$$);

-- 4. Overdue Task Auto-Escalation
-- Check pending tasks past due date -> Change Priority to High + Notify
SELECT cron.schedule('task_escalation', '0 * * * *', $$ -- Rus hourly
    UPDATE public.tasks
    SET priority = 'High'
    WHERE status = 'Pending' AND due_date < NOW() AND priority != 'High';

    INSERT INTO public.notifications (role_target, title, message, type)
    SELECT 
        NULL, -- System wide to Ops
        'ops',
        'Overdue Task Escalated',
        'Task "' || title || '" is overdue and escalated to High Priority.',
        'Warning'
    FROM public.tasks
    WHERE status = 'Pending' AND due_date < NOW() AND priority != 'High';
$$);

-- 5. Vendor Renegotiation Reminder (30 Days)
-- Placeholder logic: Checks "last_contract_date" or similar if it existed.
-- Assuming created_at for now for simplicity
SELECT cron.schedule('vendor_check', '0 9 1 * *', $$ -- Monthly
    INSERT INTO public.notifications (role_target, title, message, type)
    SELECT 
        NULL,
        'admin',
        'Vendor Contract Review',
        'Vendor ' || name || ' needs review (30 days active).',
        'Info'
    FROM public.vendors
    WHERE created_at < NOW() - INTERVAL '30 days';
$$);
