/** Mirrors backend `TenancyStatus` string enum values. */
export const TENANCY_STATUS = {
  ACTIVE: "Active",
  PENDING: "Pending",
  ENDED: "Ended",
  NOTICE_PERIOD: "NoticePeriod",
} as const;

/** Tenant still in lawful possession (messaging, maintenance context). */
export function isTenantOccupyingTenancyStatus(status: string): boolean {
  return (
    status === TENANCY_STATUS.ACTIVE || status === TENANCY_STATUS.NOTICE_PERIOD
  );
}

export function formatTenancyStatusLabel(status: string): string {
  switch (status) {
    case TENANCY_STATUS.NOTICE_PERIOD:
      return "Notice period";
    case TENANCY_STATUS.ACTIVE:
      return "Active";
    case TENANCY_STATUS.PENDING:
      return "Pending";
    case TENANCY_STATUS.ENDED:
      return "Ended";
    default:
      return status;
  }
}
