import { Icon } from "@iconify/react";
import React from "react";
import moment from "moment";
import SummaryItem from "./SummaryItem";
import { Package } from "@/types/types";

interface SummaryProps {
    car: any;
    values: any;
    numberOfDays: number;
    addons: any[];
    selectedPackage: Package | null;
    finalTotal: number;
    isPaid: boolean
    user: any
}

const Summary: React.FC<SummaryProps> = ({
    car,
    values,
    numberOfDays,
    addons,
    isPaid,
    selectedPackage,
    finalTotal,
    user
}) => {

    // Function to calculate the discounted price based on car category
    const calculateDiscountedPrice = (addons: any) => {
        switch (car.category) {
            case "Economy":
                return addons.priceEconomy
            case "SUVs":
                return addons.priceSmallSUV
            case "Mid size Sedan":
                return addons.priceStandardSUV
            default:
                return addons.price7Seater
        }
    };

    return (
        <div className=" p-6 rounded-lg">
            <div className="space-y-3">
                <hr />
                {
                    user &&
                    <>
                        <SummaryItem

                            label={"Name"}
                            value={user.displayName}

                        />


                        <SummaryItem
                            label={"Email"}
                            value={user.email}
                        />



                        <SummaryItem

                            label={"Phone"}

                            value={user.phone}

                        />


                        <SummaryItem

                            label={"Nationality"}

                            value={user.nationality}

                        />
                    </>
                }

                <hr />
                {/* Car Details */}
                <div className="flex flex-col md:flex-row items-center gap-2">
                    <img
                        className="h-32 w-44 object-contain"
                        src={car.image}
                        alt={car.name}
                    />
                    <div className="flex flex-col justify-between">
                        <p className="text-lg mb-3">
                            {car.name}{" "}
                            <small className="text-slate-500 text-xs">( or Similar )</small>
                        </p>

                        <p className="font-semibold">{numberOfDays} rental days</p>
                    </div>
                </div>

                <hr />



                {/* Pickup and Return Details */}
                <div className="border-b border-gray-200 pb-4 flex gap-2">
                    {/* Connector Line */}
                    <div className="flex flex-col gap-3 items-center justify-between">
                        <Icon icon="fluent-color:person-key-20" className="size-8" />
                        <div className="border-l-2 border-secondary h-6"></div>
                        <Icon
                            icon="fluent:person-key-32-filled"
                            className="size-8 text-gray-400"
                        />
                    </div>

                    <div className="flex flex-col gap-4 justify-between">
                        {/* Pickup Details */}
                        <div className="flex items-center space-x-3">
                            <div>
                                <span className="text-lg font-semibold text-primary">
                                    {values.location}
                                </span>
                                <p className="text-sm text-gray-500">
                                    {moment(values.pickupDate).format("ddd, DD, MM, YYYY")} |{" "}
                                    {moment(values.pickupTime).format("hh:mm A")}
                                </p>
                            </div>
                        </div>

                        {/* Return Details */}
                        <div className="flex items-center space-x-3">
                            <div>
                                <span className="text-lg font-semibold text-primary">
                                    {values.dropoffLocation || values.location}
                                </span>
                                <p className="text-sm text-gray-500">
                                    {moment(values.dropoffDate).format("ddd, DD, MM, YYYY")} |{" "}
                                    {moment(values.dropoffTime).format("hh:mm A")}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Selected Package */}
                <SummaryItem
                    label={`Package : ${selectedPackage ? selectedPackage.name : ""}`}
                    value={`AED ${(numberOfDays * (selectedPackage?.newPrice || 0)).toFixed(2)}`}
                    formula={`${numberOfDays} days × ${selectedPackage?.newPrice?.toFixed(2) || "0.00"} AED `}
                />


                <hr className="border-gray-200" />

                {/* Add-Ons Calculation */}
                {addons
                    .map((addon) => {




                        return (
                            <SummaryItem
                                key={addon.id}
                                label={`${addon.name}`}
                                value={`AED ${calculateDiscountedPrice(addon).toFixed(2)}`}
                                formula={addon.perDay ? " Per Day " : ""}

                            />
                        );
                    })}
                <hr className="border-gray-200" />

                {/* Total Price Calculation */}
                <SummaryItem
                    label="Total Price"
                    value={`AED ${finalTotal.toFixed(2)}`}
                    formula={isPaid ? "Paid" : "Payable upon dropoff"}
                />




                <hr className="border-gray-200" />


            </div>
        </div>
    );
};

export default Summary;
