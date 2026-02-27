import React, { useCallback, useEffect, useState } from "react";
import { discountTypes } from "../../../Utils/DropdownData";
import { useGetTaxTemplateByIdQuery } from "../../../redux/services/TaxTemplateServices";
import { useGetTaxTermMasterQuery } from "../../../redux/services/TaxTermMasterServices";
import { Loader } from "../../../Basic/components";
import { substract as s } from "../../../Utils/helper";

const TaxDetailsFullTemplate = ({
  salesExchangeItems,
  currentIndex: index,
  setCurrentSelectedIndex,
  readOnly,
  taxTypeId,
}) => {
  const substract = s;
  const [formulas, setFormulas] = useState([]);

  const { data, isLoading, isFetching } = useGetTaxTemplateByIdQuery(
    taxTypeId,
    { skip: !taxTypeId },
  );

  const {
    data: taxTermMaster,
    isLoading: isTemplateTermLoading,
    isFetching: isTemplateTermFetching,
  } = useGetTaxTermMasterQuery(taxTypeId);

  function getFormula(constant) {
    const split = constant.split("_");
    let name = split[0];
    let value = split[1];
    let formula = formulas.find((f) => f.name === name);
    return formula ? formula[value.toLowerCase()] : "";
  }

  function getRegex(formula) {
    let input = formula;
    const words = formula.match(/\{(.*?)\}/g);
    if (!words) return formula;
    words.forEach((element) => {
      input = input.replace(element, getFormula(element.slice(1, -1)));
    });
    return getRegex(input);
  }

  const getName = useCallback(
    (id) => {
      if (!taxTermMaster) return "";
      let data = taxTermMaster.data.find(
        (t) => parseInt(t.id) === parseInt(id),
      );
      if (!data) return "";
      return data.name;
    },
    [taxTermMaster],
  );

  useEffect(() => {
    if (data && taxTermMaster) {
      setFormulas(
        data.data.TaxTemplateDetails.map((f) => {
          return {
            name: getName(f.taxTermId),
            displayName: f.displayName,
            value: f.value,
            amount: f.amount,
          };
        }),
      );
    }
  }, [
    isLoading,
    isFetching,
    isTemplateTermFetching,
    isTemplateTermLoading,
    taxTypeId,
    taxTermMaster,
    data,
    getName,
  ]);

  const row = salesExchangeItems[index];

  if (!row) return null;

  if (
    !formulas ||
    isFetching ||
    isLoading ||
    isTemplateTermFetching ||
    isTemplateTermLoading
  ) {
    return <Loader />;
  }
  let price = isNaN(parseFloat(row["rate"])) ? 0 : parseFloat(row["rate"]);
  let qty = isNaN(parseFloat(row["exchangeQty"])) ? 0 : parseFloat(row["exchangeQty"]);
   let discountType = row["discountType"];
  let discountValue = isNaN(parseFloat(row["discountValue"]))
    ? 0
    : parseFloat(row["discountValue"]);
  let taxPercent = isNaN(parseFloat(row["taxPercent"]))
    ? 0
    : parseFloat(row["taxPercent"]);
  if (!taxTermMaster || !formulas) return <div>Tax Term Not Loaded</div>;

  function add(...args) {
    return args.reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  }

  const safeEval = (expression) => {
    try {
      if (!expression) return 0;
      return eval(expression);
    } catch (e) {
      console.error("Formula error:", expression);
      return 0;
    }
  };

  console.log(taxTermMaster, "taxTerm");

  return (
    <div
      className={`${
        Number.isInteger(index) ? "block" : "hidden"
      } bg-gray-200 z-50 overflow-auto `}
    >
      <div className=" flex text-sm justify-around text-center border-t border-r border-l border-gray-500 bo font-bold p-1">
        <span>Tax Details</span>
      </div>
      <table className="border border-gray-500 w-full text-xs text-start">
        <thead className="border border-gray-500">
          <tr>
            <th className="w-52 border border-gray-500">Tax Name</th>
            <th className="w-28 border border-gray-500">Value</th>
            <th className="w-28 border border-gray-500">Amount</th>
          </tr>
        </thead>
        <tbody>
          {formulas
            // .filter((item) => !item.isPowise)
            .map((f, i) => (
              <tr key={i}>
                <td className="border border-gray-500 font-semibold">
                  {f.displayName}
                </td>
                <td className="border border-gray-500 font-semibold text-right">
                  {safeEval(getRegex(f.value))}
                </td>
                <td className="border border-gray-500 font-semibold text-right">
                  {safeEval(getRegex(f.amount))}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaxDetailsFullTemplate;
