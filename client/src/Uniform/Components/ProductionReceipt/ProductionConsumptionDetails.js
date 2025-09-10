import React from 'react'
import FabricConsumptionDetailItem from './FabricConsumptionDetailItem'

const ProductionConsumptionDetails = ({ item, index, readOnly, productionReceiptDetails, setCurrentSelectedIndex, productionDeliveryDetailsFillData, setProductionReceiptDetails, productionDeliveryId }) => {
    return (
        <>
            {
                item?.productionConsumptionDetails?.map((val, valIndex) =>
                    <FabricConsumptionDetailItem readOnly={readOnly} setCurrentSelectedIndex={setCurrentSelectedIndex} productionDeliveryDetailsFillData={productionDeliveryDetailsFillData}
                        item={val} index={valIndex} cuttingOrderId={productionDeliveryId} productionReceiptDetails={productionReceiptDetails} setProductionReceiptDetails={setProductionReceiptDetails}


                    />

                )

            }
        </>
    )
}

export default ProductionConsumptionDetails