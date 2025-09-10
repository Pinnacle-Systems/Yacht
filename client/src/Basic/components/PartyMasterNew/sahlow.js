  <div onKeyDown={handleKeyDown} >
        <>

          <div className="w-full flex justify-between mb-2 items-center px-0.5 p-2">
            <h1 className="text-2xl font-bold text-gray-800"> Party Master</h1>
            <div className="flex items-center">
              <button
                onClick={() => {
                  setForm(true);
                  onNew();
                }}
                className="bg-green-500 text-white px-3 py-1 button rounded shadow-md"
              >
                + New
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <CommonTable
              columns={columns}
              data={allData?.data || []}
              onView={onDataClick}
              onEdit={handleEdit}
              onDelete={deleteData}
              itemsPerPage={10}
            />
          </div>


        </>

        {form === true &&
          (
            <Modal
              isOpen={form}
              form={form}
              widthClass={`${"w-[75%] "} ${isAddressExpanded ? "h-[95%]" : "h-[75%]"}`}
              onClose={() => {
                setForm(false);
                onCloseForm();
                setErrors({});
                setStep(1);
                if (openPartyModal === true) {
                  dispatch(push({ name: lastTapName }));
                }
                dispatch(setOpenPartyModal(false));

              }}
            >

{/* {name && ( */}


              <Modal
                isOpen={branchModelOpen}
                form={form}
                widthClass={`${"w-[55%] h-[50%]"}`}
                setBranchModelOpen={setBranchModelOpen}
                onClose={() => {
                  setBranchModelOpen(false)
                }}
              >



                <AddBranch partyData={allData} partyId={id} branchEmail={branchEmail} setBranchEmail={setBranchEmail} setBranchAddress={setBranchAddress}
                  branchName={branchName} setBranchName={setBranchName} branchCode={branchCode} setBranchCode={setBranchCode}
                  branchAddress={branchAddress} branchContact={branchContact} setBranchContact={setBranchContact} onNew={onNew}
                  setId={setId} childRecord={childRecord} saveData={saveData} saveExitData={saveExitData} setReadOnly={setReadOnly}
                  deleteData={deleteData} readOnly={readOnly} onCloseForm={onCloseForm}
                  handleChange={handleChange} contactDetails={contactDetails} setContactDetails={setContactDetails}
                  shippingAddress={shippingAddress} setForm={setForm} addNewAddress={addNewAddress}
                  handleInputAddress={handleInputAddress} deleteAddress={deleteAddress} removeItem={removeItem}
                  partyBranch={partyBranch} setPartyBranch={setPartyBranch} setBranchModelOpen={setBranchModelOpen} name={name}
                />



              </Modal>
    
              <Modal
              isOpen={rawMaterial}
              widthClass={`${"w-[55%] h-[50%]"}`}
                setRawmeterial={setRawMaterial}
                onClose={() => {
                  setRawMaterial(false)
                }}
             
              >
                <RawMaterial    
                  saveData={SaveBranch}
                material={material}
                setMaterial={setMaterial}
                setMaterialActive={setMaterialActive}
                materialActive = {materialActive}   />
              </Modal>

              <MastersForm

                masterClass={"pb-1"}
                onNew={onNew}
                onClose={() => {
                  setForm(false);
                  setSearchValue("");
                  setId(false);
                  onCloseForm();
                }}
                model={MODEL}
                childRecord={childRecord.current}
                saveData={saveData}
                saveExitData={saveExitData}
                setReadOnly={setReadOnly}
                deleteData={deleteData}
                readOnly={readOnly}
                emptyErrors={() => setErrors({})}
              >
                <div className="space-y-2 bg-[#f1f1f0] p-2">
                  {/* {step === 1 && ( */}
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto]">

                    <div className="space-y-2 bg-[#f1f1f0]">

                      <div className="rounded-xl border border-gray-100 bg-[#f1f1f0]  shadow-xs">
                        <h3 className="mb-1 text-sm font-semibold text-gray-900">
                          Party Type
                        </h3>
                        <div className={`space-y-2 ${readOnly ? "opacity-80" : ""}`}>
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-6">


                            <div className="grid grid-cols-2 ml-2  items-center gap-1">{console.log(isClient, "isclient", isSupplier, "issippluer")}

                              <input
                                type="radio"
                                name="type"
                                checked={isSupplier}
                                onChange={() => handleChange('supplier')}
                              />

                              <label className="text-xs">Supplier</label>
                            </div>
                            <div className="grid grid-cols-2 ml-2  items-center gap-1">
                              <input
                                type="radio"
                                name="type"
                                checked={isClient}
                                onChange={() => handleChange('client')}
                              />

                              <label className="text-xs">Client</label>
                            </div>

                            {/* <CheckBox
                              name="Is Supplier"
                              value={isSupplier}
                              setValue={setSupplier}
                              readOnly={readOnly}
                              className="hover:bg-gray-50 p-3 rounded-lg transition-colors"
                            />
                            <CheckBox
                              name="Is Client"
                              value={isClient}
                              setValue={setClient}
                              readOnly={readOnly}
                              className="hover:bg-gray-50 p-3 rounded-lg transition-colors"
                            /> */}



                            {isSupplier && (
                              <>
                                <CheckBox
                                  name="Grey Yarn"
                                  value={isGy}
                                  setValue={setIsGy}
                                  readOnly={readOnly}
                                  className="hover:bg-gray-100 p-3 rounded-lg"
                                />
                                <CheckBox
                                  name="Dyed Yarn"
                                  value={isDy}
                                  setValue={setIsDy}
                                  readOnly={readOnly}
                                  className="hover:bg-gray-100 p-3 rounded-lg"
                                />
                                <CheckBox
                                  name="Accessories"
                                  value={isAcc}
                                  setValue={setIsAcc}
                                  readOnly={readOnly}
                                  className="hover:bg-gray-100 p-3 rounded-lg"
                                />
                                <button className="text-xs "
                                onClick={ ()  =>  setRawMaterial(true)}>
                                  Add  Material
                                </button>
                              </>
                            )}

                            <div className="flex items-center gap-x-2">

                              <ToggleButton
                                name="Status"
                                options={statusDropdown}
                                value={active}
                                setActive={setActive}
                                required={true}
                                readOnly={readOnly}
                                className="bg-gray-100 p-1 rounded-lg"
                                activeClass="bg-[#f1f1f0]  shadow-sm text-blue-600 "
                                inactiveClass="text-gray-500"
                              />
                            </div>


                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="rounded-xl border border-gray-100 bg-[#f1f1f0]  p-1 shadow-xs ">
                          <div className="grid grid-cols-1 gap-x-2  md:grid-cols-2 lg:grid-cols-5 ">
                            <div className="col-span-2">

                            <TextArea
                              name={isSupplier ? "Supplier Name" : "Customer Name"}
                              type="text"
                              value={name}
                              inputClass="h-8" 
                              setValue={setName}
                              required={true}
                              readOnly={readOnly}
                              disabled={childRecord.current > 0}
                              onBlur={(e) => {
                                if (aliasName) return;
                                setAliasName(e.target.value);
                              }}

                              className="focus:ring-2 focus:ring-blue-100"
                            />
                            </div>
       
                  <div className="col-span-2">
                            <TextArea
                              name="Alias Name"
                              type="text"
                              h  inputClass="h-8" 
                              value={aliasName}
                              setValue={setAliasName}
                              required={true}
                              readOnly={readOnly}
                              disabled={childRecord.current > 0}
                              className="focus:ring-2 focus:ring-blue-100"
                            />
                  </div>
                                  <DropdownInput
                              name="City/State Name"
                              options={dropDownListMergedObject(
                                id
                                  ? cityList?.data
                                  : cityList?.data?.filter((item) => item.active),
                                "name",
                                "id"
                              )}
                              masterName="CITY MASTER"
                              lastTab={activeTab}
                              value={city}
                              setValue={setCity}
                              required={true}
                              readOnly={readOnly}
                              disabled={childRecord.current > 0}
                              className="focus:ring-2 focus:ring-blue-100"
                            />
                      


                  <div className="col-span-2 flex flex-row gap-2">
                        <div className="w-28">
                              <TextInput
                                      name="Pan No"
                                      type="pan_no"
                                      value={panNo}
                                      setValue={setPanNo}
                                      readOnly={readOnly}
                                      disabled={childRecord.current > 0}
                                      className="focus:ring-2 focus:ring-blue-100"
                                    />                           
                        </div>

                            <TextInput
                              name="GST No"
                              type="text"
                              value={gstNo}
                              setValue={setGstNo}
                              readOnly={readOnly}
                              className="focus:ring-2 focus:ring-blue-100"
                            />
                            <TextInput
                              name="CST No"
                              type="text"
                              value={cstNo}
                              setValue={setCstNo}
                              readOnly={readOnly}
                              disabled={childRecord.current > 0}
                              className="focus:ring-2 focus:ring-blue-100"
                            />
                  </div>
                         




  <div className="flex flxe-row gap-2">
            <div className="w-24">
                    <DropdownInput
                      name="Currency"
                      options={dropDownListObject(
                        id
                          ? currencyList?.data ?? []
                          : currencyList?.data?.filter(
                            (item) => item.active
                          ) ?? [],
                        "name",
                        "id"
                      )}
                      lastTab={activeTab}
                      masterName="CURRENCY MASTER"
                      value={currency}
                      setValue={setCurrency}
                      readOnly={readOnly}
                      disabled={childRecord.current > 0}
                      className="focus:ring-2 focus:ring-blue-100"
                    />
              </div>
                    

                <div className="w-24">

                      <DropdownInput
                        name="PayTerm"
                        options={dropDownListObject(
                          id
                            ? payTermList?.data
                            : payTermList?.data?.filter((item) => item.active),
                          "aliasName",
                          "id"
                        )}
                        value={payTermDay}
                        setValue={setPayTermDay}
                        // required={true}
                        readOnly={readOnly}
                        disabled={childRecord.current > 0}
                        className="focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                <div className="w-24">
                  
                      <TextInput
                        name="Pincode"
                        type="number"
                        value={pincode}
                         required={true}

                        setValue={setPincode}
                        readOnly={readOnly}
                        disabled={childRecord.current > 0}
                        className="focus:ring-2 focus:ring-blue-100 w-10"
                      />
                </div>
          
                  
                         
  </div>
       <div className="col-span-2">

                                 <TextArea name="Address"
                                  inputClass="h-10" value={address} 
                                  setValue={setAddress} required={true}
                                   readOnly={readOnly} d
                                   isabled={(childRecord.current > 0)} />
                            </div>             



                            <button
                              onClick={() => setBranchModelOpen(true)}
                              disabled={readOnly}
                              className="mt-4 flex items-center pl-3 h-9 w-24 rounded-md bg-blue-600  text-xs font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                              </svg>
                              Add Branch
                            </button>

                            {/* <TextInput
                              name="PayTerm Days"
                              type="name"
                              value={payTermDay}
                              setValue={setPayTermDay}
                              readOnly={readOnly}
                              disabled={childRecord.current > 0}
                              className="focus:ring-2 focus:ring-blue-100"
                            /> */}

                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                  <div className="">
                    {/* <div
                      className="flex justify-between items-center mb-3 cursor-pointer"
                      onClick={() => setIsAddressExpanded(!isAddressExpanded)}
                    >
                      <h3 className="text-sm font-semibold text-slate-700 flex items-center">
                        <FaChevronRight
                          className={`mr-2 text-xs transition-transform ${isAddressExpanded ? 'rotate-90' : ''}`}
                        />
                        Other Details
                      </h3>
                    </div> */}

                    {isAddressExpanded && (
                      <>
                        <div className="space-y-2">


                          {/* <div className="mb-1 flex items-center justify-between">
                            <h3 className=" text-sm font-semibold text-gray-900">
                              Shipping Addresses
                            </h3>
                            <button
                              onClick={addNewAddress}
                              disabled={readOnly}
                              className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                              </svg>
                              Add Address
                            </button>
                          </div> */}

                          {/* <div className="overflow-hidden rounded-md border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">S.no</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Address</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">AliasName</th>
                                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 bg-[#f1f1f0] ">
                                {(shippingAddress || []).map((item, index) => (
                                  <tr key={index} className="hover:bg-gray-50">
                                    <td className="whitespace-nowrap px-3 py-1.5 text-xs text-gray-600">{index + 1}</td>
                                    <td className="px-3 py-1.5">
                                      <input
                                        type="text"
                                        className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                                        value={item?.address || ""}
                                        disabled={readOnly}
                                        onChange={(e) => handleInputAddress(e.target.value, index, "address")}
                                      />
                                    </td>
                                    <td className="px-3 py-1.5">
                                      <input
                                        type="text"
                                        className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                                        value={item?.aliasName || ""}
                                        disabled={readOnly}
                                        onChange={(e) => handleInputAddress(e.target.value, index, "aliasName")}
                                      />
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-2 text-right">
                                      <button
                                        onClick={() => deleteAddress(index)}
                                        disabled={readOnly}
                                        className="p-1 text-red-500 hover:text-red-700 disabled:text-gray-400"
                                      >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                                {(!shippingAddress || shippingAddress.length === 0) && (
                                  <tr>
                                    <td colSpan="3" className="px-3 py-3 text-center">
                                      <div className="flex flex-col items-center justify-center space-y-1 text-gray-400">

                                        <p className="text-xs">No addresses found</p>

                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div> */}





{/* 
                          <div className="mb-4 flex items-center justify-between">
                            <h3 className=" text-sm font-semibold text-gray-900">Contact Details</h3>
                            <button
                              onClick={() => setContactDetails([...contactDetails, {}])}
                              disabled={readOnly || childRecord.current > 0}
                              className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                              </svg>
                              Add Contact
                            </button>
                          </div>

                          <div className="overflow-hidden rounded-md border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">S.no</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Mobile</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Email</th>
                                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 bg-[#f1f1f0] ">
                                {(contactDetails || []).map((item, index) => (
                                  <tr key={index} className="hover:bg-gray-50">
                                    <td className="whitespace-nowrap px-3 py-2 text-xs text-gray-600">{index + 1}</td>
                                    <td className="px-3 py-1.5">
                                      <input
                                        type="text"
                                        className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                                        value={item.contactPersonName || ""}
                                        onChange={(e) => {
                                          const updated = [...contactDetails];
                                          updated[index].contactPersonName = e.target.value;
                                          setContactDetails(updated);
                                        }}
                                        disabled={readOnly || childRecord.current > 0}
                                      />
                                    </td>
                                    <td className="px-3 py-1.5">
                                      <input
                                        type="text"
                                        className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                                        value={item.mobileNo || ""}
                                        onChange={(e) => {
                                          const updated = [...contactDetails];
                                          updated[index].mobileNo = e.target.value;
                                          setContactDetails(updated);
                                        }}
                                        disabled={readOnly || childRecord.current > 0}
                                      />
                                    </td>
                                    <td className="px-3 py-1.5">
                                      <input
                                        type="email"
                                        className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                                        value={item.email || ""}
                                        onChange={(e) => {
                                          const updated = [...contactDetails];
                                          updated[index].email = e.target.value;
                                          setContactDetails(updated);
                                        }}
                                        disabled={readOnly}
                                      />
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-1.5 text-right">
                                      <button
                                        onClick={() => removeItem(index)}
                                        disabled={readOnly || childRecord.current > 0}
                                        className="p-1 text-red-500 hover:text-red-700 disabled:text-gray-400"
                                      >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                                {(!contactDetails || contactDetails.length === 0) && (
                                  <tr>
                                    <td colSpan="5" className="px-3 py-3 text-center">
                                      <div className="flex flex-col items-center justify-center space-y-1 text-gray-400">

                                        <p className="text-xs">No contacts found</p>

                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div> */}









{/* 
                          <div className="mb-1 flex items-center justify-between">
                            <h3 className=" text-sm font-semibold text-gray-900">
                              Branch Addresses
                            </h3>

                          </div>

                          <div className="overflow-hidden rounded-md border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">S.no</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Address</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Contact</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Email</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Actions</th>

                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 bg-[#f1f1f0] ">
                                {(partyBranch || []).map((item, index) => (
                                  <tr key={index} className="hover:bg-gray-50">
                                    <td className="whitespace-nowrap px-3 py-1.5 text-xs text-gray-600">{index + 1}</td>

                                    <td className="px-3 py-1.5">
                                      <input
                                        type="text"
                                        className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                                        value={item?.branchName || ""}
                                        disabled={true}
                                      // onChange={(e) => handleInputAddress(e.target.value, index, "aliasName")}
                                      />
                                    </td>
                                    <td className="px-3 py-1.5">
                                      <input
                                        type="text"
                                        className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                                        value={item?.branchAddress || ""}
                                        disabled={true}
                                      // onChange={(e) => handleInputAddress(e.target.value, index, "address")}
                                      />
                                    </td>
                                    <td className="px-3 py-1.5">
                                      <input
                                        type="text"
                                        className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                                        value={item?.branchContact || ""}
                                        disabled={true}
                                      // onChange={(e) => handleInputAddress(e.target.value, index, "aliasName")}
                                      />
                                    </td>
                                    <td className="px-3 py-1.5">
                                      <input
                                        type="text"
                                        className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                                        value={item?.branchEmail || ""}
                                        disabled={true}
                                      // onChange={(e) => handleInputAddress(e.target.value, index, "aliasName")}
                                      />
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-2 text-right">
                                      <button
                                        onClick={() => deleteAddress(item?.id)}
                                        disabled={readOnly}
                                        className="p-1 text-red-500 hover:text-red-700 disabled:text-gray-400"
                                      >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                                {(!partyBranch || partyBranch.length === 0) && (
                                  <tr>
                                    <td colSpan="3" className="px-3 py-3 text-center">
                                      <div className="flex flex-col items-center justify-center space-y-1 text-gray-400">

                                        <p className="text-xs">No addresses found</p>

                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div> */}
                        </div>


                      </>
                    )}

                  </div>
                </div>
              </MastersForm>
            </Modal>
          )}
      </div>