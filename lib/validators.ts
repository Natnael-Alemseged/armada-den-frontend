import { z } from "zod"

export const CapabilitySchema = z.enum(["Submit", "ReviewApprove", "Admin"])

export const PersonSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  employment_type: z.enum(["internal", "external"]),
  management_level: z.enum(["individual_contributor", "manager", "executive"]),
  capabilities: z.array(CapabilitySchema),
  manager_id: z.string().uuid().optional(),
})

export const RoleSchema = z.object({
  id: z.string().uuid().optional(),
  role_name: z.string().min(1),
  description: z.string().optional(),
})

export const MilestoneSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  owner_id: z.string().uuid().optional(),
  period_start: z.string().datetime().optional(),
  period_end: z.string().datetime().optional(),
})

export const ProjectSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  owner_id: z.string().uuid(),
  milestone_id: z.string().uuid().optional(),
})

export const RoleAssignmentSchema = z.object({
  id: z.string().uuid().optional(),
  person_id: z.string().uuid(),
  role_id: z.string().uuid(),
  start_date: z.string().datetime(),
  end_date: z.string().datetime().optional(),
  approver_id: z.string().uuid().optional(),
  reason: z.string().optional(),
})

export const GoalSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  owner_id: z.string().uuid(),
  reviewer_id: z.string().uuid(),
  project_id: z.string().uuid(),
  milestone_id: z.string().uuid().optional(),
  verb: z.string().min(1),
  quantity: z.number(),
  object_or_metric: z.string().min(1),
  role_id: z.string().uuid(),
  immediacy: z.enum(["immediate", "delayed"]),
  direction: z.enum(["increase", "decrease"]),
  unit_of_measure: z.string().min(1),
  slope_pts_per_unit: z.number(),
  // threshold: minimum value before points accrue
  threshold: z.number(),
  calculated_points: z.number(),
  due_date: z.string().datetime().optional(),
  active: z.boolean().default(true),
  result: z.number().min(0).max(1).optional(),
  measured_value: z.number().optional(),
  measure_source: z.string().optional(),
  impact_credit: z.number().optional(),
})

export const SubGoalSchema = z.object({
  id: z.string().uuid().optional(),
  parent_goal_id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  due_date: z.string().datetime().optional(),
})

export const CheckInSchema = z.object({
  id: z.string().uuid().optional(),
  goal_id: z.string().uuid(),
  author_id: z.string().uuid(),
  date: z.string().datetime(),
  percent_complete: z.number().min(0).max(100).optional(),
  note: z.string().optional(),
  links: z.array(z.string().url()).optional(),
  files: z.array(z.string()).optional(),
})

export const ReviewSchema = z.object({
  id: z.string().uuid().optional(),
  goal_id: z.string().uuid(),
  reviewer_id: z.string().uuid(),
  decided_at: z.string().datetime(),
  result: z.number().min(0).max(1),
  impact_credit: z.number().optional(),
  note: z.string().optional(),
})

export const PayoutSchema = z.object({
  id: z.string().uuid().optional(),
  person_id: z.string().uuid(),
  computed_at: z.string().datetime(),
  role_used_id: z.string().uuid(),
  stage_used: z.string().optional(),
  variable_target_value: z.number(),
  variable_target_type: z.enum(["percent_of_salary", "fixed_amount"]),
  bonus_share: z.number().min(0).max(1),
  equity_share: z.number().min(0).max(1),
  personal_score: z.number(),
  company_factor: z.number().min(0).max(1).optional(),
  earned_variable: z.number(),
  bonus_amount: z.number(),
  equity_amount: z.number(),
  inputs_snapshot: z.object({
    goals: z.array(
      z.object({
        goal_title: z.string(),
        result: z.number(),
        impact_credit: z.number(),
        weight: z.number(),
      }),
    ),
  }),
})

export const PayoutComputeRequestSchema = z.object({
  person_id: z.string().uuid(),
  company_factor: z.number().min(0).max(1).optional(),
  variable_target_value: z.number().optional(),
  variable_target_type: z.enum(["percent_of_salary", "fixed_amount"]).optional(),
  bonus_share: z.number().min(0).max(1).optional(),
  equity_share: z.number().min(0).max(1).optional(),
})

export const WebhookRequestSchema = z.object({
  action: z.enum(["create", "update", "delete"]),
  entity: z.enum([
    "Person",
    "RoleAssignment",
    "Milestone",
    "Project",
    "Goal",
    "CheckIn",
    "Review",
    "Payout",
    "SubGoal",
  ]),
  data: z.record(z.string(), z.unknown()),
  id: z.string().uuid().optional(), // for update/delete operations
})

export const EntitySchemas = {
  Person: PersonSchema,
  RoleAssignment: RoleAssignmentSchema,
  Milestone: MilestoneSchema,
  Project: ProjectSchema,
  Goal: GoalSchema,
  CheckIn: CheckInSchema,
  Review: ReviewSchema,
  Payout: PayoutSchema,
  SubGoal: SubGoalSchema,
} as const

export type WebhookRequest = z.infer<typeof WebhookRequestSchema>
export type EntityType = keyof typeof EntitySchemas

export const checkInSchema = CheckInSchema
export const goalSchema = GoalSchema
export const projectSchema = ProjectSchema
export const subGoalSchema = SubGoalSchema
