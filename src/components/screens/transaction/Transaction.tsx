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
import { Suspense, useEffect, useState } from "react";
import RadioItems from "@/components/ui/custom/radio/RadioItems";
import { CustomInput as Input } from "@/components/ui/custom/input";
import { ChevronDown, Search } from "lucide-react";
import DataTable from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { tag } from "@/types";
import { ITransaction, useGetTransactionQuery } from "@/api/transaction";
import TransactionDetails from "./TransactionDetails";
import { DatePicker } from "@/components/ui/custom/date/DatePicker";

const status = [
  { label: "Success", value: "success" },
  { label: "Pending", value: "pending" },
];

const TransactionTable = () => {
  const router = useRouter();
  const [queryValues, setQueryValues] = useState<{ [name: string]: string | string[] | number }>(
    {}
  );
  const { result } = useGetTransactionQuery(queryValues);
  const columns: ColumnDef<
    Pick<ITransaction, "_id" | "reason" | "reference" | "amount" | "status" | "createdAt">
  >[] = [
    {
      accessorKey: "index",
      header: () => <span className="whitespace-nowrap font-semibold text-base">S/N</span>,
      cell: ({ row }) => <span>{row.index + 1}</span>,
    },
    {
      accessorKey: "reason",
      header: () => <span className="whitespace-nowrap font-semibold text-base">Reason</span>,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <span className="font-normal text-base text-ctm-secondary-200 capitalize">
            {item.reason}
          </span>
        );
      },
    },
    {
      accessorKey: "reference",
      header: () => (
        <span className="whitespace-nowrap font-semibold text-base">Transaction ID</span>
      ),
      cell: ({ row }) => (
        <span className="font-normal text-base text-ctm-secondary-200">
          {row.original.reference}
        </span>
      ),
    },
    // {
    //   accessorKey: "type",
    //   header: () => <span className="whitespace-nowrap font-semibold text-base">Type</span>,
    //   cell: ({ row }) => {
    //     return (
    //       <span className="font-normal text-base text-ctm-secondary-200">{row.original.type}</span>
    //     );
    //   },
    // },
    {
      accessorKey: "createdAt",
      header: () => <span className="whitespace-nowrap font-semibold text-base">Date/Time</span>,
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        const formatted = new Intl.DateTimeFormat("en-NG", {
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }).format(date);

        return <span className="font-normal text-base text-ctm-secondary-200">{formatted}</span>;
      },
    },

    {
      accessorKey: "amount",
      header: () => <span className="whitespace-nowrap font-semibold text-base">Amount</span>,
      cell: ({ row }) => {
        return (
          <span className="font-normal text-base text-ctm-secondary-200">
            ₦{row.original.amount}
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
      cell: ({ row }) => (
        <PopOver className="max-w-[110px]">
          <div className="flex flex-col justify-center items-center">
            <TransactionDetails transaction={row.original._id}>
              <Button className="w-[100px] justify-start" variant={"ghost"}>
                <Icon width={15} height={15} name="eye" />
                View
              </Button>
            </TransactionDetails>

            <Button className="w-[100px] justify-start" variant={"ghost"}>
              <Icon width={15} height={15} name="trash" />
              Delete
            </Button>
          </div>
        </PopOver>
      ),
    },
  ];
  // const handleQueryChange = (key: string, selectedOptions: string | string[] | number) => {
  //   setQueryValues((prevqueryValues) => ({
  //     ...prevqueryValues,
  //     ...{ [key]: selectedOptions },
  //   }));
  // };
  const handleRefresh = (value: typeof queryValues) => {
    router.push(stringifyUrl(value));
    result.refetch();
  };
  const { allParams } = useUrlState();
  useEffect(() => {
    setQueryValues({
      ...allParams,
      page: Number(allParams.page ?? 1),
      limit: Number(allParams.limit ?? 10),
    });
  }, [allParams]);
  return (
    <main className="flex flex-col  p-6 bg-white">
      <h1 className="text-2xl font-bold mb-5">Transations</h1>

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
              disabled={result.isRefetching}
            >
              <Refresh2
                className={cn("transition-transform", {
                  "animate-spin text-ctm-primary-400": result.isRefetching,
                })}
              />
            </Button>
            <Button
              onClick={() => {
                setQueryValues((prev) => {
                  router.push(`transaction/${stringifyQuery({ page: 1, limit: 10 })}#0`);
                  return { page: prev.page, limit: prev.limit };
                });
                result.refetch();
              }}
              variant={"secondary"}
              className="text-ctm-secondary-300"
            >
              Clear Filter
            </Button>

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
            <DatePicker
              trigger={
                <Button variant={"secondary"}>
                  Date
                  <ChevronDown />
                </Button>
              }
              value={queryValues.date ? new Date(queryValues.date as string) : undefined}
              onSelect={(date) =>
                setQueryValues((prev) => ({ ...prev, date: date?.toISOString() ?? "" }))
              }
            />
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
          {result.data?.data && result.data?.data?.length > 0 ? (
            <Pagination
              total={result.data?.total ?? 10}
              page={Number(queryValues.page)}
              limit={Number(queryValues.limit)}
            />
          ) : null}
        </div>
      </div>
    </main>
  );
};

const Transaction = () => (
  <Suspense>
    <TransactionTable />
  </Suspense>
);

export default Transaction;
