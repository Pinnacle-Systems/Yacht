const [formulas, setFormulas] = useState([])

const { data, isLoading, isFetching } = useGetTaxTemplateByIdQuery(taxTypeId, { skip: !taxTypeId })

const { data: taxTermMaster, isLoading: isTemplateTermLoading, isFetching: isTemplateTermFetching } = useGetTaxTermMasterQuery(taxTypeId, { skip: !taxTypeId })


function getRegex(formula) {
    if (!formula) return formula
    let input = formula;
    const words = formula.match(/\{(.*?)\}/g)
    if (!words) return formula
    words.forEach(element => {
        input = input.replace(element, getFormula(element.slice(1, -1)))
    });
    return getRegex(input)
}


function getFormula(constant) {
    const split = constant.split("_");
    let name = split[0];
    let value = split[1];
    let formula = formulas.find(f => f.name === name)
    return formula ? formula[value.toLowerCase()] : ""
}
useEffect(() => {
    if (data) {
        setFormulas(data.data.TaxTemplateDetails.map(f => { return { name: (getName(f.taxTermId)), isPowise: getIsPoItem(f?.taxTermId), displayName: f.displayName, value: f.value, amount: f.amount } }))
    }

}, [isLoading, isFetching, isTemplateTermFetching, isTemplateTermLoading, taxTypeId])

function getName(id) {
    if (!taxTermMaster) return ""
    let data = taxTermMaster.data.find(t => parseInt(t.id) === parseInt(id))
    if (!data) return ""
    return data.name
}

function getFormulaByName(formulaName) {
    let formula = formulas.find(f => f.name === formulaName)
    return formula ? formula : ''
}

function getIsPoItem(id) {
    if (!taxTermMaster) return false
    let data = taxTermMaster.data.find(t => parseInt(t.id) === parseInt(id))
    if (!data) return false
    return data.isPoWise
}

function getTotalQuantity(taxTerm, valueOrAmount) {
    let calculateItems = poItems.filter(item => item.yarnId || item.fabricId || item.accessoryId)
    let formula = getRegex(getFormulaByName(taxTerm)[valueOrAmount])
    const total = calculateItems.reduce((accumulator, currentItem) => {
        let price = isNaN(parseFloat(currentItem["price"])) ? 0 : parseFloat(currentItem["price"])
        let qty = isNaN(parseFloat(currentItem["qty"])) ? 0 : parseFloat(currentItem["qty"])
        let discountType = currentItem["discountType"];
        let discountValue = isNaN(parseFloat(currentItem["discountValue"])) ? 0 : parseFloat(currentItem["discountValue"]);
        let taxPercent = isNaN(parseFloat(currentItem["taxPercent"])) ? 0 : parseFloat(currentItem["taxPercent"])
        return accumulator + eval(formula)
    }, 0)
    return total
}

function handleInputChange(e) {
    setTotalDiscount(prev => {
        let newState = { ...prev }
        newState[e.target.name] = e.target.value;
        return newState
    })
}
if (!formulas || isFetching || isLoading) {
    return <Loader />
}
let discountType = totalDiscount.type
let discountValue = totalDiscount.value ? totalDiscount.value : 0;
let grossAmount = getTotalQuantity("GROSS", "amount")
let netAmount = getTotalQuantity("NET", "amount")

let discountAmount = totalDiscount.type === "Flat" ? discountValue : (netAmount / 100 * discountValue).toFixed(2)
let poValue = (netAmount - discountAmount)
let roundOff = Math.ceil(poValue)
