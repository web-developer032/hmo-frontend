/** Shared API entity shapes (JSON from backend). */

export type ListMeta = { page: number; limit: number; total: number };

export type Property = {
  id: string;
  landlordId: string;
  address: string;
  city: string;
  postcode: string;
  propertyType: string;
  hmoLicenseNumber?: string;
  epcRating?: string;
  status: string;
  numberOfRooms: number;
  displayName?: string;
  headlineRentAmount?: number;
  headlineDepositAmount?: number;
  headlineRentFrequency?: string;
  description?: string;
  rooms?: Room[];
  createdAt: string;
  updatedAt: string;
};

export type Listing = {
  id: string;
  propertyId: string;
  roomId: string | null;
  title: string;
  summary: string | null;
  rentAmount: number;
  rentFrequency?: string;
  depositAmount: number | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  property?: Property;
  room?: Room | null;
};

export type ListingApplication = {
  id: string;
  listingId: string;
  applicantUserId: string;
  tenancyId?: string | null;
  status: string;
  message: string | null;
  createdAt: string;
  updatedAt: string;
  listing?: Listing;
  applicant?: { id: string; name: string; email: string };
  /** Set when applicant has a tenant profile (for landlord “View profile”). */
  applicantTenantProfileId?: string | null;
};

export type Room = {
  id: string;
  propertyId: string;
  roomNumber: string;
  rentAmount: string | number;
  rentFrequency?: string;
  status: string;
  areaSqM?: number;
  description?: string;
  allowsMultipleTenants?: boolean;
  maxTenants?: number;
  createdAt: string;
  updatedAt: string;
  property?: Property;
};

export type TenantProfile = {
  id: string;
  userId: string;
  fullName: string;
  contactNumber: string;
  address?: string;
  dateOfBirth?: string;
  idDocumentType?: string;
  idDocumentNumber?: string;
  idDocumentExpiry?: string;
  employerName?: string;
  jobTitle?: string;
  income?: number;
  guarantorName?: string;
  guarantorContact?: string;
  onboardingChecklist?: string[];
  createdAt: string;
  updatedAt: string;
  user?: { id: string; name: string; email: string };
  tenancies?: Tenancy[];
};

export type LandlordProfile = {
  id: string;
  userId: string;
  companyName?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  postcode?: string;
  website?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; name: string; email: string };
};

export type Tenancy = {
  id: string;
  tenantId: string;
  roomId?: string | null;
  propertyId?: string | null;
  startDate: string;
  endDate?: string;
  rentAmount: string | number;
  deposit: string | number;
  rentFrequency?: string;
  /** `Active` | `Pending` | `Ended` | `NoticePeriod` */
  status: string;
  createdAt: string;
  updatedAt: string;
  tenantProfile?: TenantProfile;
  room?: Room;
  property?: Property;
};

export type RentPayment = {
  id: string;
  tenancyId: string;
  amount: string | number;
  dueDate: string;
  paymentDate?: string;
  status: string;
  paymentReference?: string | null;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
  tenancy?: Tenancy;
};

export type RentSummaryTotals = {
  totalExpectedRent: number;
  totalReceivedRent: number;
  totalOverdueRent: number;
};

export type ComplianceRecord = {
  id: string;
  propertyId: string;
  documentType: string;
  documentReference: string;
  issueDate: string;
  expiryDate: string;
  documentUrl?: string;
  isCompliant?: boolean;
  createdAt: string;
  updatedAt: string;
  property?: Property;
};

export type HmoDocument = {
  id: string;
  propertyId: string;
  tenancyId?: string;
  tenantId?: string;
  listingId?: string | null;
  documentType: string;
  documentName: string;
  documentUrl: string;
  uploadDate?: string;
  expiryDate?: string;
  isPublic?: boolean;
  tenantAgreed?: boolean;
  landlordAgreed?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MaintenanceTicket = {
  id: string;
  propertyId: string;
  roomId?: string;
  description: string;
  categories: string[];
  status: string;
  tenantId?: string;
  landlordId?: string;
  priority?: string;
  createdAt: string;
  updatedAt: string;
};

export type HmoMessage = {
  id: string;
  senderId: string;
  receiverId: string;
  content?: string;
  type: string;
  attachments?: string[];
  propertyId?: string;
  maintenanceTicketId?: string;
  isRead?: boolean;
  createdAt: string;
  /** Present when API loads sender relation (tenancy thread / moderation). */
  sender?: { id: string; name: string; email?: string };
};

export type HmoNotification = {
  id: string;
  recipientId: string;
  type: string;
  subject: string;
  body: string;
  metadata?: string;
  relatedEntityId?: string;
  status: string;
  scheduledAt?: string;
  readAt?: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type ConversationPartner = {
  id: string;
  name: string;
  email: string;
  /** DM conversation id for WebSocket + cache tags; null before first persisted thread row. */
  conversationId: string | null;
};

/** Primary platform admin for “Message support” (landlord/tenant DMs). */
export type MessagingSupportContact = {
  id: string;
  name: string;
  email: string;
};

/** Admin inbox: existing tenancy group chats. */
export type AdminTenancyThreadRow = {
  conversationId: string;
  tenancyId: string;
  title: string;
  summary: string;
  lastMessageAt: string | null;
};

/** Landlord/tenant tenancy thread list (sorted by latest message). */
export type TenancyChatSummaryRow = {
  tenancyId: string;
  conversationId: string | null;
  title: string;
  summary: string;
  lastMessageAt: string | null;
};

export type LandlordDashboardMetrics = {
  totalProperties: number;
  totalRooms: number;
  occupiedRooms: number;
  monthlyIncome: number;
  outstandingRent: number;
  complianceScore: number;
  pendingListingApplications: number;
};

export type PlatformAdminMetrics = {
  totalUsers: number;
  totalLandlords: number;
  totalTenants: number;
  totalProperties: number;
  totalRooms: number;
};

export type RentTrendChartPoint = { date: string; amount: number };

export type OccupancyChartPoint = {
  date: string;
  occupancyRate: number;
  occupiedRooms: number;
  totalRooms: number;
};

export type IncomePerPropertyChartPoint = {
  propertyId: string;
  propertyName: string;
  totalIncome: number;
};

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  roles: string[];
  createdAt: string;
};

export type SubscriptionPlan = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  maxProperties: number;
  maxRooms: number;
  maxTenants: number;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Subscription = {
  id: string;
  userId: string;
  tier: string;
  status: string;
  planId?: string | null;
  plan?: SubscriptionPlan | null;
  startDate?: string;
  endDate?: string;
  maxProperties?: number;
  maxRooms?: number;
  maxTenants?: number;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; name: string; email: string };
};
