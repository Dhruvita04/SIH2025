import React, { useState, useMemo } from "react";
import Rating from "@mui/material/Rating";
import Stack from "@mui/material/Stack";
import RatingComp from "@/components/common/RatingComp";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { IoMdAlarm } from "react-icons/io";
import { FaMoneyBill1Wave } from "react-icons/fa6";
import { FaUserCircle } from "react-icons/fa";
import { formatDateString } from "@/utils/date";
import BookingButton from "./BookingButton";
import type { Doctor } from "@/types";

interface DoctorInterestsProps {
  interests: string[];
}

const DoctorInterests: React.FC<DoctorInterestsProps> = ({ interests }) => (
  <div className="space-y-3">
    <h4 className="text-sm font-medium text-gray-700">Specializations</h4>
    <div className="flex flex-wrap gap-2">
      {interests.map((interest) => (
        <span
          key={interest}
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700"
        >
          {interest}
        </span>
      ))}
    </div>
  </div>
);

interface DoctorAvailabilityProps {
  date: string;
}

const DoctorAvailability: React.FC<DoctorAvailabilityProps> = ({ date }) =>
  date && (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
      <IoMdAlarm className="h-5 w-5 text-primary-600" />
      <div className="flex-1">
        <p className="text-xs text-gray-500">Next available</p>
        <p className="text-sm font-medium text-gray-900">{formatDateString(date)}</p>
      </div>
    </div>
  );

interface DoctorFeesProps {
  fees60min: number;
  fees30min: number;
}

const DoctorFees: React.FC<DoctorFeesProps> = ({ fees60min, fees30min }) => (
  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
    <FaMoneyBill1Wave className="h-5 w-5 text-primary-600" />
    <div className="flex-1">
      <p className="text-xs text-gray-500">Consultation fees</p>
      <div className="flex space-x-4 text-sm">
        <span className="font-semibold text-primary-600">₹{fees60min}/60min</span>
        <span className="font-semibold text-primary-600">₹{fees30min}/30min</span>
      </div>
    </div>
  </div>
);

// Define the type for the doctor prop

interface DoctorCardProps {
  doctor: Doctor;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor }) => {
  const [doctorRating, setDoctorRating] = useState<number | null>(
    doctor.rating || 0,
  );

  // Convert buffer data to base64 image
  const base64Image = useMemo(() => {
    if (!doctor.image) return null;
    const binary = String.fromCharCode(...doctor.image.data);
    return `data:image/jpeg;base64,${window.btoa(binary)}`;
  }, [doctor.image]);

  return (
    <div className="card-elevated p-6 space-y-6 hover:scale-105 transition-all duration-300 max-w-sm mx-auto group">
      {/* Doctor Header */}
      <div className="flex items-start space-x-4">
        <div className="relative">
          {base64Image ? (
            <img
              className="w-16 h-16 rounded-2xl object-cover shadow-md"
              src={base64Image}
              alt="Doctor"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center">
              <FaUserCircle className="h-10 w-10 text-primary-600" />
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-secondary-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 truncate">{doctor.name}</h3>
          <p className="text-primary-600 font-medium text-sm">{doctor.title}</p>
          
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-1">
              <HiOutlineUserGroup className="h-4 w-4 text-gray-400" />
              <span className="text-xs text-gray-500">{doctor.numSessions} sessions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {doctorRating ? (
            <Rating
              name="doctor-rating"
              value={doctorRating}
              precision={0.1}
              readOnly
              size="small"
            />
          ) : (
            <RatingComp
              text="Review"
              variant="text"
              doctor={doctor}
              setDoctorRating={setDoctorRating}
            />
          )}
        </div>
        <span className="text-sm text-gray-500">
          {doctorRating && doctorRating > 0
            ? `${doctorRating} (${doctor.numReviews})`
            : "No reviews"}
        </span>
      </div>

      {/* Interests */}
      {doctor.interests && <DoctorInterests interests={doctor.interests} />}
      
      {/* Availability */}
      {doctor.nearestApp && <DoctorAvailability date={doctor.nearestApp} />}
      
      {/* Fees */}
      <DoctorFees fees60min={doctor.fees60min} fees30min={doctor.fees30min} />

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-2">
        <button className="flex-1 btn-outline text-sm py-2">
          View Profile
        </button>
        <BookingButton doctor={doctor} />
      </div>
    </div>
  );
};

export default React.memo(DoctorCard);
