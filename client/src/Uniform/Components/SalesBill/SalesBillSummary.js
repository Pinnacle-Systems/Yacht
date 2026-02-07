import React from "react";
import { discountTypes } from "../../../Utils/DropdownData";
import { numberToWords } from "number-to-words";
import { groupBy } from "lodash";
const SalesBillSummary = ({
  salesBillItems = [],
  readOnly,
  discountType,
  setDiscountType,
  discountValue,
  setDiscountValue,
}) => {
  const totalAmount = salesBillItems.reduce(
    (sum, row) => sum + (Number(row.taxable) || 0),
    0,
  );

  // const grossAmount = purchaseBillItems.reduce(
  //   (sum, row) => sum + (Number(row.rate) || 0) * (Number(row.qty) || 0),
  //   0,
  // );
  const discountValueNum = Number(discountValue) || 0;

  let discountAmount = 0;
  if (discountType === "Flat") {
    discountAmount = discountValueNum;
  } else if (discountType === "Percentage") {
    discountAmount = (totalAmount * discountValueNum) / 100;
  }

  const grossAmount = totalAmount - discountAmount;

  // 2️⃣ DISCOUNT

  // 3️⃣ NET & ROUNDING
  const netValue = grossAmount;
  const netAmount = Math.round(netValue);
  const roundoff = netAmount - netValue;

  const taxGroupWise = groupBy(salesBillItems, "taxPercent");
  const displayTaxRows = Object.entries(taxGroupWise)
    .filter(([taxPercent]) => Number(taxPercent) > 0) // ignore null / 0
    .map(([taxPercent, items]) => {
      const taxable = items.reduce(
        (sum, item) => sum + item.qty * item.rate,
        0,
      );

      const taxRate = Number(taxPercent);
      const halfTax = taxRate / 2;

      return {
        taxPercent: taxRate,
        halfTax,
        taxable,
        sgstAmount: (taxable * halfTax) / 100,
        cgstAmount: (taxable * halfTax) / 100,
      };
    });

  // =================== UI ===================
  return (
    <div className="bg-gray-200 rounded w-[500px]">
      <table className="border border-gray-500 w-full text-xs table-fixed">
        <thead>
          <tr className="bg-gray-300">
            <th className="border border-gray-500 p-1">Description</th>
            <th className="border border-gray-500 p-1">Value</th>
            <th className="border border-gray-500 p-1">Amount</th>
          </tr>
        </thead>

        <tbody>
          {/* DISCOUNT TYPE */}
          <tr>
            <td className="border border-gray-500">Discount Type</td>
            <td colSpan={2} className="border border-gray-500">
              <select
                disabled={readOnly}
                value={discountType}
                className="w-full h-8"
                onChange={(e) => setDiscountType(e.target.value)}
                autoFocus={true}
              >
                {discountTypes.map((d, i) => (
                  <option key={i} value={d.value}>
                    {d.show}
                  </option>
                ))}
              </select>
            </td>
          </tr>

          {/* DISCOUNT VALUE */}
          <tr>
            <td className="border border-gray-500">Discount</td>
            <td colSpan={2} className="border border-gray-500">
              <input
                type="number"
                disabled={readOnly}
                className="w-full h-7 text-right"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
              />
            </td>
          </tr>
          <tr>
            <td className="border border-gray-500 font-semibold">Total</td>
            <td />
            <td className="border border-gray-500 text-right">
              {totalAmount.toFixed(2)}
            </td>
          </tr>
          {/* DISCOUNT AMOUNT */}
          <tr>
            <td className="border border-gray-500 font-semibold">
              Discount Amount
            </td>
            <td />
            <td className="border border-gray-500 text-right">
              {discountAmount.toFixed(2)}
            </td>
          </tr>
          {/* GROSS */}
          <tr>
            <td className="border border-gray-500 font-semibold">Gross</td>
            <td />
            <td className="border border-gray-500 text-right">
              {grossAmount.toFixed(2)}
            </td>
          </tr>

          {/* DISPLAY ONLY – NO CALC IMPACT */}
          {displayTaxRows.map((tax, index) => (
            <React.Fragment key={index}>
              <tr>
                <td className="border border-gray-500 font-semibold">SGST</td>
                <td className="border border-gray-500 text-right">
                  {tax.halfTax}
                </td>
                <td className="border border-gray-500 text-right">
                  {tax.sgstAmount.toFixed(2)}
                </td>
              </tr>

              <tr>
                <td className="border border-gray-500 font-semibold">CGST</td>
                <td className="border border-gray-500 text-right">
                  {tax.halfTax}
                </td>
                <td className="border border-gray-500 text-right">
                  {tax.cgstAmount.toFixed(2)}
                </td>
              </tr>
            </React.Fragment>
          ))}

          {/* NET */}
          <tr>
            <td className="border border-gray-500 font-semibold">Net</td>
            <td />
            <td className="border border-gray-500 text-right">
              {netAmount.toFixed(2)}
            </td>
          </tr>

          {/* ROUNDOFF */}
          <tr>
            <td className="border border-gray-500 font-semibold">Roundoff</td>
            <td />
            <td className="border border-gray-500 text-right">
              {roundoff.toFixed(2)}
            </td>
          </tr>

          {/* AMOUNT IN WORDS */}
          <tr>
            <td className="border border-gray-500 font-semibold">
              Amount in Words
            </td>
            <td colSpan={2} className="border border-gray-500 text-right">
              {numberToWords.toWords(netAmount)} Only
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default SalesBillSummary;
