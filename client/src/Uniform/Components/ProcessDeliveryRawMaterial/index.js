import React, { useEffect, useState } from 'react'

import StockSelectionFillGrid from './StockSelectionFillGrid';
import Modal from '../../../UiComponents/Modal';
import _ from 'lodash';
import Fabric from './Fabric';

const RawMaterial = ({ storeId, rawMaterialType, currentProgramIndex, programDetails, setProgramDetails, styleColors, readOnly }) => {
  const prevRawMaterials = programDetails[currentProgramIndex]?.rawMaterials ? programDetails[currentProgramIndex]["rawMaterials"] : []
  const [rawMaterials, setRawMaterials] = useState(prevRawMaterials)
  const [fillGrid, setFillGrid] = useState(false);

  useEffect(() => {
    setRawMaterials(prevRawMaterials)
  }, [currentProgramIndex, prevRawMaterials])

  useEffect(() => {
    setProgramDetails(prev => {
      let newPrograms = structuredClone(prev)
      if (newPrograms[currentProgramIndex]) {
        newPrograms[currentProgramIndex]["rawMaterials"] = rawMaterials;
      }
      return newPrograms
    })
  }, [rawMaterials, currentProgramIndex])

  function removeFabricItem(removeItem) {
    setRawMaterials(localInwardItems => {
      return localInwardItems.filter(item =>
        !(removeItem.fabricId === item.fabricId
          &&
          removeItem.designId === item.designId
          &&
          removeItem.gaugeId === item.gaugeId
          &&
          removeItem.loopLengthId === item.loopLengthId
          &&
          removeItem.gsmId === item.gsmId
          &&
          removeItem.kDiaId === item.kDiaId
          &&
          removeItem.fDiaId === item.fDiaId
          &&
          removeItem.colorId === item.colorId
          &&
          removeItem.uomId === item.uomId
          &&
          removeItem.lotNo == item.lotNo
          &&
          removeItem.processId === item.processId
          &&
          removeItem.storeId === item.storeId
        )
      )
    });
  }

  function removeYarnItem(removeItem) {
    setRawMaterials(localInwardItems => {
      return localInwardItems.filter(item =>
        !(removeItem.yarnId === item.yarnId
          &&
          removeItem.colorId === item.colorId
          &&
          removeItem.uomId === item.uomId
          &&
          removeItem.lotNo == item.lotNo
          &&
          removeItem.processId === item.processId
          &&
          removeItem.storeId === item.storeId
        )
      )
    });
  }

  const getIssuedPropertyYarn = (stockItem, property) => {
    const issueDetails = programDetails.map(item => item.rawMaterials).flat()
    const stockItemIssuedDetails = issueDetails.filter(item =>
      !(
        stockItem.yarnId === item.yarnId
        &&
        stockItem.colorId === item.colorId
        &&
        stockItem.uomId === item.uomId
        &&
        stockItem.lotNo == item.lotNo
        &&
        stockItem.processId === item.processId
        &&
        stockItem.storeId === item.storeId
      )
    )
    const totalQty = stockItemIssuedDetails.reduce((accumulation, currentValue) => {
      return (parseFloat(accumulation) + parseFloat(currentValue[property] ? currentValue[property] : 0))
    }, 0)
    return totalQty
  }

  const getIssuedPropertyFabric = (stockItem, property) => {
    const issueDetails = programDetails.map(item => item.rawMaterials).flat()
    const stockItemIssuedDetails = issueDetails.filter(item =>
      !(
        stockItem.fabricId === item.fabricId
        &&
        stockItem.designId === item.designId
        &&
        stockItem.gaugeId === item.gaugeId
        &&
        stockItem.loopLengthId === item.loopLengthId
        &&
        stockItem.gsmId === item.gsmId
        &&
        stockItem.kDiaId === item.kDiaId
        &&
        stockItem.fDiaId === item.fDiaId
        &&
        stockItem.colorId === item.colorId
        &&
        stockItem.uomId === item.uomId
        &&
        stockItem.lotNo == item.lotNo
        &&
        stockItem.processId === item.processId
        &&
        stockItem.storeId === item.storeId
      )
    )
    const totalQty = stockItemIssuedDetails.reduce((accumulation, currentValue) => {
      return (parseFloat(accumulation) + parseFloat(currentValue[property] ? currentValue[property] : 0))
    }, 0)
    return totalQty
  }

  useEffect(() => {
    if (rawMaterials.length === 0) {
      setFillGrid(true)
    } else {
      setFillGrid(false)
    }
  }, [rawMaterials])
  return (
    <>
      <Modal isOpen={fillGrid} onClose={() => { setFillGrid(false) }} widthClass={"bg-gray-300"}>
        <StockSelectionFillGrid styleColors={styleColors}
          storeId={storeId} getIssuedPropertyYarn={getIssuedPropertyYarn} getIssuedPropertyFabric={getIssuedPropertyFabric} rawMaterialType={rawMaterialType} rawMaterials={rawMaterials} setRawMaterials={setRawMaterials} setFillGrid={setFillGrid} />
      </Modal>
      <div>

        {rawMaterialType.includes("F") ?
          <Fabric readOnly={readOnly} removeItem={removeFabricItem} setFillGrid={setFillGrid}
            getIssuedProperty={getIssuedPropertyFabric} rawMaterials={rawMaterials} setRawMaterials={setRawMaterials} />
          :
          <></>
        }

      </div>
    </>
  )
}

export default RawMaterial