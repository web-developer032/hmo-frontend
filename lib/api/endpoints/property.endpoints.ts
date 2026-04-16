import { T, tagItem, tagItems, tagList, tagMerge } from "@/lib/api/cache-tags";
import { hmoApi } from "@/lib/api/hmo-api";
import type { ApiListSuccess, ApiSuccess } from "@/lib/api/types";
import type { Property, Room } from "@/lib/types/entities";

type PropertyListArg = {
  page?: number;
  limit?: number;
  search?: string;
  propertyType?: string;
  status?: string;
};

type RoomListArg = {
  propertyId: string;
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
};

export const propertyApi = hmoApi.injectEndpoints({
  endpoints: (builder) => ({
    getProperties: builder.query<ApiListSuccess<Property>, PropertyListArg | void>(
      {
        query: (arg) => {
          const params = new URLSearchParams();
          const a = arg ?? {};
          if (a.page != null) params.set("page", String(a.page));
          if (a.limit != null) params.set("limit", String(a.limit));
          if (a.search) params.set("search", a.search);
          if (a.propertyType) params.set("propertyType", a.propertyType);
          if (a.status) params.set("status", a.status);
          const q = params.toString();
          return { url: `properties${q ? `?${q}` : ""}`, method: "GET" };
        },
        providesTags: (res) => tagItems(T.Property, res),
      },
    ),
    getProperty: builder.query<ApiSuccess<Property>, string>({
      query: (id) => ({ url: `properties/${id}`, method: "GET" }),
      providesTags: (_res, _err, id) => tagItem(T.Property, id),
    }),
    createProperty: builder.mutation<
      ApiSuccess<Property>,
      Record<string, unknown>
    >({
      query: (body) => ({
        url: "properties",
        method: "POST",
        body,
      }),
      invalidatesTags: tagList(T.Property),
    }),
    updateProperty: builder.mutation<
      ApiSuccess<Property>,
      { id: string; body: Record<string, unknown> }
    >({
      query: ({ id, body }) => ({
        url: `properties/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_res, _err, { id }) =>
        tagMerge(tagItem(T.Property, id), tagList(T.Property)),
    }),
    deleteProperty: builder.mutation<void, string>({
      query: (id) => ({
        url: `properties/${id}`,
        method: "DELETE",
        responseHandler: async (response) =>
          response.status === 204 ? null : response.json(),
      }),
      invalidatesTags: (_res, _err, id) =>
        tagMerge(
          tagItem(T.Property, id),
          tagList(T.Property),
          tagItem(T.Room, id),
        ),
    }),
    getRooms: builder.query<ApiListSuccess<Room>, RoomListArg>({
      query: ({ propertyId, page, limit, status, search }) => {
        const params = new URLSearchParams();
        if (page != null) params.set("page", String(page));
        if (limit != null) params.set("limit", String(limit));
        if (status) params.set("status", status);
        if (search) params.set("search", search);
        const q = params.toString();
        return {
          url: `properties/${propertyId}/rooms${q ? `?${q}` : ""}`,
          method: "GET",
        };
      },
      providesTags: (_res, _err, { propertyId }) =>
        tagItem(T.Room, propertyId),
    }),
    getRoom: builder.query<
      ApiSuccess<Room>,
      { propertyId: string; roomId: string }
    >({
      query: ({ propertyId, roomId }) => ({
        url: `properties/${propertyId}/rooms/${roomId}`,
        method: "GET",
      }),
      providesTags: (_res, _err, { roomId }) => tagItem(T.Room, roomId),
    }),
    createRoom: builder.mutation<
      ApiSuccess<Room>,
      { propertyId: string; body: Record<string, unknown> }
    >({
      query: ({ propertyId, body }) => ({
        url: `properties/${propertyId}/rooms`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_res, _err, { propertyId }) =>
        tagMerge(
          tagItem(T.Room, propertyId),
          tagItem(T.Property, propertyId),
          tagList(T.Property),
        ),
    }),
    updateRoom: builder.mutation<
      ApiSuccess<Room>,
      { propertyId: string; roomId: string; body: Record<string, unknown> }
    >({
      query: ({ propertyId, roomId, body }) => ({
        url: `properties/${propertyId}/rooms/${roomId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_res, _err, { propertyId, roomId }) =>
        tagMerge(
          tagItem(T.Room, propertyId),
          tagItem(T.Room, roomId),
          tagItem(T.Property, propertyId),
        ),
    }),
    deleteRoom: builder.mutation<
      void,
      { propertyId: string; roomId: string }
    >({
      query: ({ propertyId, roomId }) => ({
        url: `properties/${propertyId}/rooms/${roomId}`,
        method: "DELETE",
        responseHandler: async (response) =>
          response.status === 204 ? null : response.json(),
      }),
      invalidatesTags: (_res, _err, { propertyId, roomId }) =>
        tagMerge(
          tagItem(T.Room, propertyId),
          tagItem(T.Room, roomId),
          tagItem(T.Property, propertyId),
        ),
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetPropertiesQuery,
  useGetPropertyQuery,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
  useGetRoomsQuery,
  useGetRoomQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
} = propertyApi;
