import { T, TID, invTags, tagItem, tagItems } from "@/lib/api/cache-tags";
import { hmoApi } from "@/lib/api/hmo-api";
import type { ApiListSuccess, ApiSuccess } from "@/lib/api/types";
import type { HmoDocument } from "@/lib/types/entities";

type DocListArg = {
  page?: number;
  limit?: number;
  search?: string;
  propertyId?: string;
  tenancyId?: string;
  documentType?: string;
  isPublic?: boolean;
} | void;

export const documentApi = hmoApi.injectEndpoints({
  endpoints: (builder) => ({
    getDocuments: builder.query<ApiListSuccess<HmoDocument>, DocListArg>({
      query: (arg) => {
        const params = new URLSearchParams();
        const a = arg ?? {};
        if (a.page != null) params.set("page", String(a.page));
        if (a.limit != null) params.set("limit", String(a.limit));
        if (a.search) params.set("search", a.search);
        if (a.propertyId) params.set("propertyId", a.propertyId);
        if (a.tenancyId) params.set("tenancyId", a.tenancyId);
        if (a.documentType) params.set("documentType", a.documentType);
        if (a.isPublic != null) params.set("isPublic", String(a.isPublic));
        const q = params.toString();
        return { url: `documents${q ? `?${q}` : ""}`, method: "GET" };
      },
      providesTags: (res) => tagItems(T.HmoDocument, res),
    }),
    getDocumentsExpired: builder.query<ApiListSuccess<HmoDocument>, void>({
      query: () => ({ url: "documents/expired", method: "GET" }),
      providesTags: tagItem(T.HmoDocument, TID.EXPIRED),
    }),
    getDocumentsExpiringSoon: builder.query<
      ApiListSuccess<HmoDocument>,
      { days?: number } | void
    >({
      query: (arg) => {
        const params = new URLSearchParams();
        if (arg?.days != null) params.set("days", String(arg.days));
        const q = params.toString();
        return {
          url: `documents/expiring-soon${q ? `?${q}` : ""}`,
          method: "GET",
        };
      },
      providesTags: tagItem(T.HmoDocument, TID.EXPIRING),
    }),
    getDocument: builder.query<ApiSuccess<HmoDocument>, string>({
      query: (id) => ({ url: `documents/${id}`, method: "GET" }),
      providesTags: (_r, _e, id) => tagItem(T.HmoDocument, id),
    }),
    uploadDocumentFile: builder.mutation<
      ApiSuccess<{
        documentUrl: string;
        storedFileName: string;
        originalName: string;
        mimeType: string;
        size: number;
      }>,
      File
    >({
      query: (file) => {
        const body = new FormData();
        body.append("file", file);
        return { url: "documents/upload", method: "POST", body };
      },
    }),
    createDocument: builder.mutation<
      ApiSuccess<HmoDocument>,
      Record<string, unknown>
    >({
      query: (body) => ({ url: "documents", method: "POST", body }),
      invalidatesTags: invTags(T.HmoDocument),
    }),
    updateDocument: builder.mutation<
      ApiSuccess<HmoDocument>,
      { id: string; body: Record<string, unknown> }
    >({
      query: ({ id, body }) => ({
        url: `documents/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: invTags(T.HmoDocument),
    }),
    deleteDocument: builder.mutation<void, string>({
      query: (id) => ({
        url: `documents/${id}`,
        method: "DELETE",
        responseHandler: async (response) =>
          response.status === 204 ? null : response.json(),
      }),
      invalidatesTags: invTags(T.HmoDocument),
    }),
    tenantAgreeDocument: builder.mutation<ApiSuccess<HmoDocument>, string>({
      query: (id) => ({ url: `documents/${id}/tenant-agree`, method: "POST" }),
      invalidatesTags: invTags(T.HmoDocument),
    }),
    landlordAgreeDocument: builder.mutation<ApiSuccess<HmoDocument>, string>({
      query: (id) => ({
        url: `documents/${id}/landlord-agree`,
        method: "POST",
      }),
      invalidatesTags: invTags(T.HmoDocument),
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetDocumentsQuery,
  useGetDocumentsExpiredQuery,
  useGetDocumentsExpiringSoonQuery,
  useGetDocumentQuery,
  useUploadDocumentFileMutation,
  useCreateDocumentMutation,
  useUpdateDocumentMutation,
  useDeleteDocumentMutation,
  useTenantAgreeDocumentMutation,
  useLandlordAgreeDocumentMutation,
} = documentApi;
