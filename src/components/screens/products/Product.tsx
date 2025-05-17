"use client";
import React, { useState } from "react";
import Tab from "@/components/ui/custom/Tabs";
import ProductCategory from "./ProductCategory";
import AllProduct from "./AllProduct";
import ReviewProduct from "./ReviewProduct";
import { Icon } from "@/components/ui/Icon";
import CreateCategoryModal from "./CreateCategory";
import { CustomButton as Button } from "@/components/ui/custom/button";

const Product = () => {
  const [activeTab, setActiveTab] = useState<string>("0");
  const [openCategoryModal, setOpenCategoryModal] = useState(false);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="bg-white rounded-lg p-4 w-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold mb-4">Products</h1>

        {activeTab === "1" && (
          <Button
            variant="ctm-outline"
            slotBefore={<Icon name="add" height={16} width={16} />}
            onClick={() => setOpenCategoryModal(true)}
          >
            <p>New Category</p>
          </Button>
        )}
      </div>

      <div>
        <Tab
          value={activeTab}
          onValueChange={handleTabChange}
          items={[
            {
              trigger: (
                <button className="px-4 py-2 text-sm font-medium hover:text-indigo-700">
                  All Products
                </button>
              ),
              content: <AllProduct />,
              key: "0",
            },
            {
              trigger: (
                <button className="px-4 py-2 text-sm font-medium hover:text-indigo-700">
                  Product Category
                </button>
              ),
              content: <ProductCategory />,
              key: "1",
            },
            {
              trigger: (
                <button className="px-4 py-2 text-sm font-medium hover:text-indigo-700">
                  Reviewing Products
                </button>
              ),
              content: <ReviewProduct />,
              key: "2",
            },
          ]}
        />
      </div>

      {/* ✅ Category Modal */}
      <CreateCategoryModal open={openCategoryModal} onOpenChange={setOpenCategoryModal} />
    </div>
  );
};

export default Product;
