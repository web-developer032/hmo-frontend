import { T, TID, invTags, tagItem } from "@/lib/api/cache-tags";
import { hmoApi } from "@/lib/api/hmo-api";
import type { ApiListSuccess, ApiSuccess } from "@/lib/api/types";
import type {
  AdminTenancyThreadRow,
  ConversationPartner,
  HmoMessage,
  MessagingSupportContact,
  TenancyChatSummaryRow,
} from "@/lib/types/entities";

const ADMIN_TENANCY_THREADS = "ADMIN-TENANCY-THREADS";
const MY_TENANCY_THREADS = "MY-TENANCY-THREADS";

export const messagingApi = hmoApi.injectEndpoints({
  endpoints: (builder) => ({
    getConversationPartners: builder.query<
      ApiSuccess<ConversationPartner[]>,
      void
    >({
      query: () => ({ url: "messages/conversations", method: "GET" }),
      providesTags: tagItem(T.HmoMessage, TID.PARTNERS),
    }),
    getSupportContact: builder.query<
      ApiSuccess<MessagingSupportContact | null>,
      void
    >({
      query: () => ({ url: "messages/support/contact", method: "GET" }),
      providesTags: tagItem(T.HmoMessage, "SUPPORT-CONTACT"),
    }),
    getAdminTenancyThreads: builder.query<
      ApiSuccess<AdminTenancyThreadRow[]>,
      void
    >({
      query: () => ({
        url: "messages/admin/tenancy-threads",
        method: "GET",
      }),
      providesTags: tagItem(T.HmoMessage, ADMIN_TENANCY_THREADS),
    }),
    getTenancyChatSummaries: builder.query<
      ApiSuccess<TenancyChatSummaryRow[]>,
      void
    >({
      query: () => ({ url: "messages/tenancy-threads", method: "GET" }),
      providesTags: tagItem(T.HmoMessage, MY_TENANCY_THREADS),
    }),
    getConversationMessages: builder.query<
      ApiListSuccess<HmoMessage>,
      {
        conversationPartnerId: string;
        /** When set, aligns cache + WebSocket invalidation with `THREAD-CV-*` (Telegram-style live DM). */
        dmConversationId?: string | null;
        page?: number;
        limit?: number;
        propertyId?: string;
        maintenanceTicketId?: string;
      }
    >({
      query: ({
        conversationPartnerId,
        page,
        limit,
        propertyId,
        maintenanceTicketId,
      }) => {
        const params = new URLSearchParams();
        if (page != null) params.set("page", String(page));
        if (limit != null) params.set("limit", String(limit));
        if (propertyId) params.set("propertyId", propertyId);
        if (maintenanceTicketId)
          params.set("maintenanceTicketId", maintenanceTicketId);
        const q = params.toString();
        return {
          url: `messages/conversations/${conversationPartnerId}${q ? `?${q}` : ""}`,
          method: "GET",
        };
      },
      providesTags: (_res, _e, arg) =>
        arg.dmConversationId
          ? tagItem(T.HmoMessage, `THREAD-CV-${arg.dmConversationId}`)
          : tagItem(T.HmoMessage, `THREAD-${arg.conversationPartnerId}`),
    }),
    getUnreadMessageCount: builder.query<ApiSuccess<{ count: number }>, void>({
      query: () => ({ url: "messages/unread/count", method: "GET" }),
      providesTags: tagItem(T.HmoMessage, TID.UNREAD),
    }),
    getMessage: builder.query<ApiSuccess<HmoMessage>, string>({
      query: (id) => ({ url: `messages/${id}`, method: "GET" }),
      providesTags: (_r, _e, id) => tagItem(T.HmoMessage, id),
    }),
    createMessage: builder.mutation<
      ApiSuccess<HmoMessage>,
      Record<string, unknown>
    >({
      query: (body) => ({ url: "messages", method: "POST", body }),
      invalidatesTags: [T.HmoMessage, { type: T.HmoMessage, id: TID.PARTNERS }],
    }),
    openTenancyThread: builder.mutation<
      ApiSuccess<{ id: string }>,
      string
    >({
      query: (tenancyId) => ({
        url: `messages/threads/tenancy/${tenancyId}/open`,
        method: "POST",
      }),
      invalidatesTags: [
        T.HmoMessage,
        { type: T.HmoMessage, id: ADMIN_TENANCY_THREADS },
        { type: T.HmoMessage, id: MY_TENANCY_THREADS },
      ],
    }),
    getThreadMessages: builder.query<
      ApiListSuccess<HmoMessage>,
      { conversationId: string; page?: number; limit?: number }
    >({
      query: ({ conversationId, page = 1, limit = 50 }) => {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(limit));
        return {
          url: `messages/threads/${conversationId}?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: (_r, _e, { conversationId }) =>
        tagItem(T.HmoMessage, `THREAD-CV-${conversationId}`),
    }),
    createThreadMessage: builder.mutation<
      ApiSuccess<HmoMessage>,
      { conversationId: string; content: string }
    >({
      query: ({ conversationId, content }) => ({
        url: `messages/threads/${conversationId}`,
        method: "POST",
        body: { content },
      }),
      invalidatesTags: (_r, _e, { conversationId }) => [
        { type: T.HmoMessage, id: `THREAD-CV-${conversationId}` },
        { type: T.HmoMessage, id: ADMIN_TENANCY_THREADS },
        { type: T.HmoMessage, id: MY_TENANCY_THREADS },
      ],
    }),
    updateMessage: builder.mutation<
      ApiSuccess<HmoMessage>,
      { id: string; body: Record<string, unknown> }
    >({
      query: ({ id, body }) => ({
        url: `messages/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: invTags(T.HmoMessage),
    }),
    deleteMessage: builder.mutation<void, string>({
      query: (id) => ({
        url: `messages/${id}`,
        method: "DELETE",
        responseHandler: async (response) =>
          response.status === 204 ? null : response.json(),
      }),
      invalidatesTags: invTags(T.HmoMessage),
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetConversationPartnersQuery,
  useGetSupportContactQuery,
  useGetTenancyChatSummariesQuery,
  useGetAdminTenancyThreadsQuery,
  useGetConversationMessagesQuery,
  useGetUnreadMessageCountQuery,
  useGetMessageQuery,
  useCreateMessageMutation,
  useOpenTenancyThreadMutation,
  useGetThreadMessagesQuery,
  useCreateThreadMessageMutation,
  useUpdateMessageMutation,
  useDeleteMessageMutation,
} = messagingApi;
