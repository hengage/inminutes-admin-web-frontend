"use client";
import { useRouter } from "next/navigation";
import Tag from "@/components/general/Tag";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/custom/Pagination";
import PopOver from "@/components/ui/custom/PopOver";
import { Icon } from "@/components/ui/Icon";
import { Refresh2 } from "iconsax-react";
import useUrlState from "@/hooks/useUrlState";
import { cn, stringifyQuery, stringifyUrl } from "@/lib/utils";
import CheckboxItems from "@/components/ui/custom/checkbox/CheckboxItems";
import { Suspense, useEffect, useState } from "react";
import RadioItems from "@/components/ui/custom/radio/RadioItems";
import { CustomInput as Input } from "@/components/ui/custom/input";
import { CheckSquare2, Search, X } from "lucide-react";
import DataTable from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { tag } from "@/types";
import {
  IProduct,
  useDeleteProductMutation,
  useGetProductCategoriesQuery,
  useGetProductsQuery,
  useUpdateProductStatusMutation,
} from "@/api/product";
import { useToast } from "@/providers/ToastContext";

const status = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
];

const AllProductTable = () => {
  const router = useRouter();
  const [queryValues, setQueryValues] = useState<{ [name: string]: string | string[] | number }>(
    {}
  );
  const { showSuccess } = useToast();

  const { item: categoryItems, isLoading: categoryItemsLoading } = useGetProductCategoriesQuery({});
  const { result, isLoading, refetch } = useGetProductsQuery(queryValues);
  const { mutate: deleteItem, isPending } = useDeleteProductMutation();
  const { mutate: updateStatus, isPending: updateLoading } = useUpdateProductStatusMutation();
  const handleRefresh = (value: typeof queryValues) => {
    router.push(stringifyUrl(value));
    refetch();
  };
  const handleStatusUpdate = (
    productId: string,
    newStatus: "approved" | "rejected" | "pending"
  ) => {
    updateStatus(
      {
        productId,
        status: newStatus,
      },
      {
        onSuccess: () => {
          showSuccess("Product status updated successfully");
        },
        onError: (err: unknown) => {
          console.error("Error updating status:", err);
        },
      }
    );
  };
  const handleDelete = (productId: string) => {
    deleteItem(productId, {
      onSuccess: () => {
        showSuccess("Product deleted successfully");
      },
      onError: (err: unknown) => {
        console.error("Error deleting product:", err);
      },
    });
  };

  const { allParams } = useUrlState();
  useEffect(() => {
    setQueryValues({
      ...allParams,
      page: Number(allParams.page ?? 1),
      limit: Number(allParams.limit ?? 10),
    });
  }, [allParams]);

  const columns: ColumnDef<
    Pick<IProduct, "_id" | "name" | "vendor" | "cost" | "category" | "status">
  >[] = [
    {
      accessorKey: "index",
      header: () => <span className="whitespace-nowrap font-semibold text-base">S/N</span>,
      cell: ({ row }) => <span>{row.index + 1}</span>,
    },
    {
      accessorKey: "name",
      header: () => <span className="whitespace-nowrap font-semibold text-base">Product name</span>,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-1">
            <Image
              src={
                "https://res.cloudinary.com/dx73n7qiv/image/upload/v1717115764/tmp-7-1717115763718_dvecds.jpg"
              }
              alt={item.name}
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="font-normal text-base text-ctm-secondary-200 capitalize">
              {item.name}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "_id",
      header: () => <span className="whitespace-nowrap font-semibold text-base">ID Number</span>,
      cell: ({ row }) => (
        <span className="font-normal text-base text-ctm-secondary-200">{row.original._id}</span>
      ),
    },
    {
      accessorKey: "cost",
      header: () => <span className="whitespace-nowrap font-semibold text-base">Price </span>,
      cell: ({ row }) => {
        return (
          <span className="font-normal text-base text-ctm-secondary-200">{row.original.cost}</span>
        );
      },
    },
    {
      accessorKey: "category",
      header: () => <span className="whitespace-nowrap font-semibold text-base">Category</span>,
      cell: ({ row }) => {
        return (
          <span className="font-normal text-base text-ctm-secondary-200 capitalize">
            {row.original.category.name}
          </span>
        );
      },
    },
    {
      accessorKey: "vendor",
      header: () => <span className="whitespace-nowrap font-semibold text-base">Vendor</span>,
      cell: ({ row }) => {
        return (
          <span className="font-normal text-base text-ctm-secondary-200 capitalize">
            {row.original.vendor || "N/A"}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: () => <span className="whitespace-nowrap font-semibold text-base">Status</span>,
      cell: ({ row }) => {
        return <Tag tag={row.original.status.toLowerCase() as tag} />;
      },
    },
    {
      accessorKey: "actions",
      header: () => <span className="whitespace-nowrap font-semibold text-base">Actions</span>,
      cell: ({ row }) => {
        const status = row.original.status.toLowerCase();
        const productId = row.original._id;

        return (
          <PopOver className="max-w-[110px]">
            <div className="flex flex-col justify-center items-center">
              <Button
                className="w-[100px] justify-start"
                variant={"ghost"}
                onClick={() => router.push(`/product/${productId}`)}
              >
                <Icon width={15} height={15} name="eye" />
                View
              </Button>

              {/* Status-dependent buttons */}
              {status === "pending" && (
                <>
                  <Button
                    className="w-[100px] justify-start text-green-600"
                    variant={"ghost"}
                    onClick={() => handleStatusUpdate(productId, "approved")}
                    // disabled={updateLoading}
                  >
                    <CheckSquare2 />
                    Approve
                  </Button>
                  <Button
                    className="w-[100px] justify-start text-red-600"
                    variant={"ghost"}
                    onClick={() => handleStatusUpdate(productId, "rejected")}
                    // disabled={updateLoading}
                  >
                    <X />
                    Reject
                  </Button>
                </>
              )}

              {status === "rejected" && (
                <Button
                  className="w-[100px] justify-start text-green-600"
                  variant={"ghost"}
                  onClick={() => handleStatusUpdate(productId, "approved")}
                  disabled={updateLoading}
                >
                  <CheckSquare2 />
                  Approve
                </Button>
              )}

              {/* Delete button - always present */}
              <Button
                className="w-[100px] justify-start"
                variant={"ghost"}
                onClick={() => handleDelete(productId)}
                disabled={isPending}
              >
                {isPending ? (
                  <Refresh2 className="animate-spin" />
                ) : (
                  <Icon width={15} height={15} name="trash" />
                )}
                Delete
              </Button>
            </div>
          </PopOver>
        );
      },
    },
  ];
  return (
    <div className="my-4">
      <div className="bg-ctm-background rounded-md border-ctm-secondary-100 p-2 mb-2">
        <div className="flex gap-4 w-full my-4">
          <Button
            className="stroke-ctm-secondary-300 hover:stroke-ctm-primary-500 px-4"
            variant={"secondary"}
            size="icon"
            onClick={() => {
              handleRefresh(queryValues);
            }}
            disabled={isLoading}
          >
            <Refresh2
              className={cn("transition-transform", {
                "animate-spin text-ctm-primary-400": isLoading,
              })}
            />
          </Button>
          <Button
            onClick={() => {
              setQueryValues((prev) => {
                router.push(`product/${stringifyQuery({ page: 1, limit: 10 })}#0`);
                return { page: prev.page, limit: prev.limit };
              });
              refetch();
            }}
            variant={"secondary"}
            className="text-ctm-secondary-300"
          >
            Clear Filter
          </Button>
          <PopOver
            trigger={
              <Button
                className="stroke-ctm-secondary-300"
                variant={"secondary"}
                disabled={categoryItemsLoading}
              >
                Category
                {categoryItemsLoading ? (
                  <Refresh2 className="animate-spin ml-2" size={16} />
                ) : (
                  <Icon name="arrow-down" height={16} width={16} />
                )}
              </Button>
            }
            className="bg-ctm-background border border-ctm-primary-500 rounded-[16px] p-1"
          >
            <CheckboxItems
              onSubmit={(params) => {
                setQueryValues((prev) => ({ ...prev, category: params.map((item) => item.value) }));
              }}
              selectedItems={
                categoryItems?.filter((item) =>
                  (queryValues.category as string[])?.includes(item.value)
                ) || []
              }
              showSearchBox
              searchPlaceholder="Categories"
              items={categoryItems || []}
            />
          </PopOver>
          <PopOver
            trigger={
              <Button className="stroke-ctm-secondary-300" variant={"secondary"}>
                Status
                <Icon name="arrow-down" height={16} width={16} />
              </Button>
            }
            className="bg-ctm-background border border-ctm-primary-500 rounded-[16px] p-1"
          >
            <RadioItems
              onSubmit={(params) => {
                setQueryValues((prev) => ({ ...prev, status: params ?? "" }));
              }}
              selectedItem={(queryValues.status as string) ?? ""}
              items={status}
            />
          </PopOver>
          <div className="w-full flex justify-end justify-self-end">
            <Input
              className="w-fit bg-transparent"
              slotBefore={<Search className="text-ctm-secondary-300" />}
              placeholder="Search"
              value={queryValues.search}
              onChange={(e) => setQueryValues((prev) => ({ ...prev, search: e.target.value }))}
            />
          </div>
        </div>

        <DataTable dataQuery={result} columns={columns} />
        {result.data?.data.length && result.data?.data.length > 0 ? (
          <Pagination
            total={result.data?.total ?? 10}
            page={Number(queryValues.page)}
            limit={Number(queryValues.limit)}
          />
        ) : null}
      </div>
    </div>
  );
};

const AllProduct = () => (
  <Suspense>
    <AllProductTable />
  </Suspense>
);

export default AllProduct;
