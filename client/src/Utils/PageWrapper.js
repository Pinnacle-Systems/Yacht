import { Page, Text, View } from "@react-pdf/renderer";
import React from "react";
import Header from "./Header";
import FactoryAddress from "./FactoryAddress";
import tw from "./tailwind-react-pdf";

const PageWrapper = ({
  heading,
  singleData,
  DeliveryNo,
  DeliveryDate,
  children,
  styles,
  value,
  header,
}) => {
  return (
    <Page
      size="A4"
      wrap
      style={[
        // reserve space at page bottom for footer (≈45px)
        tw("p-2 text-sm flex flex-col h-full relative"),
        { fontFamily: "Helvetica" },
      ]}
    >
      {/* Border container — this will not include the footer area because Page has pb */}
      <View
        style={{
          flex: 1,
          borderWidth: 1,
          borderColor: "gray",
          margin: 4,

          // no need to add bottom padding here because Page pb reserves it
        }}
      >
        {header && (
          <View fixed>
            <Header
              heading={heading}
              singleData={singleData}
              DeliveryNo={DeliveryNo}
              DeliveryDate={DeliveryDate}
              styles={styles}
            />
          </View>
        )}

        {/* main content — make it grow so it stops before page paddingBottom */}
        <View>{children}</View>
      </View>

      {/* Footer: fixed to page bottom (won't overlap content because Page pb reserved space) */}
      <View
        fixed
        style={{
          left: 0,
          right: 0,
          bottom: 1, // small offset from page bottom
          paddingHorizontal: 5,
        }}
      >
        {header && (
          <View style={tw("mx-auto")}>{value ? "" : <FactoryAddress />}</View>
        )}
        <View style={tw("text-right text-xs w-full pb-1 pt-1")}>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page No : ${pageNumber} / ${totalPages}`
            }
            fixed
          />
        </View>
      </View>
    </Page>
  );
};

export default PageWrapper;
