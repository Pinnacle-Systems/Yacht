// POFormComments.js (React Component)

import React from 'react';

const comments = [
    "Fabric Shipment Allowance / tolerance 0 to +5% Maximum.",
    "Mill will follow buyer Original swatch for quality and approved LD for bulk.",
    "Mill has to follow Quality, Stretch, Handfeel & Visual as per approval.",
    "Need to use good dyeing stuff, can not be color fastness issues.",
    "Testing must meet test requirements as per Buyer Standards given with P.O., mill need to submit Internal Test report before shipment.",
    "PPS & testing fabric will be free of cost.",
    "Each color 1st Dye Lot has to be approved and without approval can not proceed further production.",
    "Bulk Lots approvals & Testing Report has to be approved before shipping.",
    "Bulk Lots approvals & Testing Report has to be approved before shipping.",
    "Bulk procedure has to follow properly as per our STD and has to sign it back before starting the production.",
    "Fabric cuttable width can not be less than requirement, or mill has to give compensation for shortage width issue.",
    "Package individual rolls covered with plastic sheet and braided bag outside."
];

export default function POFormComments() {
    return (
        <div className="border border-gray-400 p-3 mt-4 rounded bg-white shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Comments & Important Points to be Noted:
            </h3>
            <ul className="list-disc pl-5 text-xs text-gray-800 space-y-1">
                {comments.map((item, idx) => (
                    <li key={idx}>{item}</li>
                ))}
            </ul>
            <div className="mt-4 text-xs text-gray-700">
                <div className="flex justify-between">
                    <span>Supplier Signature/Date</span>
                    <span>EUNOIA TEXTILES CO., LIMITED</span>
                </div>
                <div className="text-right font-semibold mt-1">Authorised Signatory</div>
            </div>
        </div>
    );
}
