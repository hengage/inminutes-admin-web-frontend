import https from "@/lib/axios";
import { QUERY_KEYS } from "@/lib/constants/queryKeys";
import { stringifyQuery } from "@/lib/utils";
import { IListItem, IPaginationData } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface IProduct {
  _id: string;
  name: string;
  image: string;
  price: number;
  cost: string | number;
  category: ICategory;
  status: "Approved" | "Pending" | "Rejected";
  vendor: string | null;
  productCode: string;
  createdAt: string;
}

/**
 * Product filter parameters
 */
export interface ProductFilter {
  search?: string;
  category?: string;
  status?: string;
  dateRange?: {
    start?: string;
    end?: string;
  };
  priceRange?: {
    min?: number;
    max?: number;
  };
  page?: number;
  limit?: number;
}

/**
 * Hook to fetch products with filtering and pagination
 */
export const useGetProductsQuery = (filter: ProductFilter = {}) => {
  const result = useQuery<
    IPaginationData<
      Pick<IProduct, "_id" | "name" | "vendor" | "cost" | "category" | "status" | "createdAt">
    >,
    Error
  >({
    queryKey: [QUERY_KEYS.PRODUCTS, filter],
    queryFn: async () => {
      const response = await https.get(
        "/product/list" + `${stringifyQuery(filter as Record<string, string | string[] | number>)}`
      );
      return response.data.data.products;
    },
    enabled: Object.entries(filter as Record<string, string | string[] | number>).length > 0,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    select: (data: any) => ({
      data: data.docs,
      total: data.totalDocs,
      page: data.page,
      limit: data.limit,
      totalPages: data.pagingCounter,
    }),
  });
  return { isLoading: result.isPending, data: result.data, result, refetch: result.refetch };
};

/**
 * Hook to fetch a single product by ID
 */
export const useGetProductByIdQuery = (productId: string | string[]) => {
  return useQuery<IProductDetails, Error>({
    queryKey: [QUERY_KEYS.PRODUCTS, productId],
    queryFn: async () => {
      const response = await https.get(`/product/${productId}`);
      return response.data.data.product;
    },
    enabled: Boolean(productId),
  });
};

export const useGetProductCategoriesQuery = (
  filter: Record<string, string | number | string[]> = {}
) => {
  const query = filter && Object.keys(filter).length > 0 ? `?${stringifyQuery(filter)}` : "";

  const result = useQuery<ICategory[], Error>({
    queryKey: [QUERY_KEYS.Categories, filter],
    queryFn: async () => {
      const response = await https.get(`/product/categories${query}`);
      return response.data.data.data;
    },
    enabled: true,
  });

  const item: IListItem[] = (result.data ?? []).map((e) => ({
    label: e.name,
    value: e._id,
  }));

  return { ...result, item };
};

export const useGetCategoriesQuery = (filter: unknown = {}) => {
  const result = useQuery<
    IPaginationData<Pick<ICategory, "_id" | "name" | "totalProducts">>,
    Error
  >({
    queryKey: [QUERY_KEYS.Categories, filter],
    queryFn: async () => {
      const response = await https.get(
        "/product/categories" +
          `${stringifyQuery(filter as Record<string, string | string[] | number>)}`
      );
      return response.data.data;
    },
    enabled: filter
      ? Object.entries(filter as Record<string, string | string[] | number>).length > 0
      : true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    select: (data: any) => ({
      data: data.data,
      total: data.total,
      page: data.page,
      limit: data.limit,
      totalPages: data.pages,
    }),
  });
  return { isLoading: result.isPending, data: result.data, result, refetch: result.refetch };
};

export const useGetReviewingProductsQuery = ({
  page = 1,
  limit = 10,
}: { page?: number; limit?: number } = {}) => {
  const result = useQuery<
    IPaginationData<
      Pick<IProduct, "_id" | "name" | "vendor" | "cost" | "category" | "status" | "createdAt">
    >,
    Error
  >({
    queryKey: [QUERY_KEYS.PRODUCTS, { status: "pending", page, limit }],
    queryFn: async () => {
      const response = await https.get(`/product/list?status=pending&page=${page}&limit=${limit}`);
      return response.data.data.products;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    select: (data: any) => ({
      data: data.docs,
      total: data.totalDocs,
      page: data.page,
      limit: data.limit,
      totalPages: data.totalPages,
    }),
  });

  return {
    isLoading: result.isPending,
    data: result.data,
    result,
    refetch: result.refetch,
  };
};

export const useCreateCategorytMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, Partial<ICategory>>({
    mutationFn: async (data) => {
      const response = await https.post("/product/category", data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.Categories] });
    },
  });
};

/**
 * Hook to update an existing product
 */
export const useUpdateProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, { productId: string; data: Partial<IProduct> }>({
    mutationFn: async ({ productId, data }) => {
      const response = await https.put(`/product/${productId}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS] });
    },
  });
};

/**
 * Hook to delete a product
 */
export const useDeleteProductMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, string>({
    mutationFn: async (productId) => {
      const response = await https.delete(`/product/${productId}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS] });
    },
  });
};

/**
 * Hook to update product status
 */
export const useUpdateProductStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    unknown,
    Error,
    { productId: string; status: "approved" | "rejected" | "pending" }
  >({
    mutationFn: async ({ productId, status }) => {
      const response = await https.patch(`/products/${productId}/status`, { status });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS] });
    },
  });
};

export interface ICategory {
  _id: string;
  name: string;
  image?: string;
  totalProducts?: string;
}

export interface IAddOn {
  item: string;
  cost: string | number;
}

export interface IProductDetails {
  _id: string;
  name: string;
  image: string;
  description: string;
  quantity: number;
  cost: string | number;
  tags: string[];
  addOns: IAddOn[];
  category: ICategory;
  vendor: string | null;
  status: "Approved" | "Pending" | "Rejected";
  isDeleted: boolean;
  createdAt: string;
}
