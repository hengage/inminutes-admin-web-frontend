import { IListItem } from "@/types";
import React, { useState } from "react";
import { CustomInput as Input } from "../input";
import { stringContains } from "@/lib/utils";
import { CustomButton as Button } from "../button";
import Radio from "./Radio";
import { PopoverClose } from "@radix-ui/react-popover";
import { Icon } from "../../Icon";
import { RadioGroup } from "../../radio-group";

interface RadioItemOptionsProps {
  items: Array<IListItem>;
  defaultSelectedItems?: IListItem;
  selectedItem?: string;
  onSubmit?: (value: string | null) => void;
  /** Passing this, implies updating check items won't be handled by this component */
  //   onCheckboxToggle?: (item: ILi, checkedItems: Array<CheckboxOptionsItemChildren>) => void;
  addButtonText?: string;
  searchPlaceholder?: string;
  //   onAddNewValue?: (value: string) => void;
  //   onRemoveItem?: (id: string, labelName: string) => void;
  showSearchBox?: boolean;
  showAddNewItemButton?: boolean;
  showAddCloseButton?: boolean;
}

const RadioItems = ({
  items,
  showSearchBox,
  searchPlaceholder,
  onSubmit,
  ...props
}: Omit<React.ComponentProps<typeof RadioGroup>, "onSubmit"> & RadioItemOptionsProps) => {
  const [value, setValue] = useState(props.selectedItem);
  const [searchValue, setSearchValue] = useState("");
  const [renderedItems, setRenderedItems] = useState(items);
  const handleSearch = (searchBy: string) => {
    if (!searchBy) setRenderedItems(items);
    else {
      const searchedItems = items.filter(({ label }) => stringContains(label, searchBy));
      setRenderedItems(searchedItems);
    }
    setSearchValue(searchBy);
  };
  return (
    <RadioGroup
      value={value}
      onValueChange={(value) => {
        setValue(value);
        onSubmit?.(value);
      }}
      {...props}
    >
      {showSearchBox && (
        <div className="flex flex-col gap-2">
          <Input
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={searchPlaceholder}
            slotAfter={<Icon name="arrow-down" height={16} width={16} />}
          />
        </div>
      )}
      <div className="flex flex-col items-start gap-2 max-h-[200px] overflow-y-auto w-full">
        {renderedItems.map((item, i) => (
          <span key={i} className="w-full px-2 py-1 rounded-md hover:bg-ctm-primary-100">
            <Radio value={item.value} label={item.label} />
          </span>
        ))}
      </div>
      <div className="border-t border-ctm-secondary-50 p-2 flex justify-between items-center gap-2">
        <PopoverClose>
          {/* <Button onClick={() => onSubmit?.(value ?? null)} variant={"ctm-primary"}>
            {addButtonText ?? "Apply"}
          </Button> */}
        </PopoverClose>
        <PopoverClose>
          <Button
            onClick={() => {
              setValue(undefined);
              onSubmit?.(null);
            }}
            variant={"ctm-outline"}
          >
            Cancel
          </Button>
        </PopoverClose>
      </div>
    </RadioGroup>
  );
};

export default RadioItems;
