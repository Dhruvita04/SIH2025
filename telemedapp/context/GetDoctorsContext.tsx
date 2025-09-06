"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

type Doctor = {
  id: string;
  name: string;
  title: string;
  numSessions: number;
  nearestApp: string;
  fees60min: number;
  fees30min: number;
  interests: string[];
  rating: number;
  numReviews: number;
  language: string[];
  speciality: string;
  gender: string;
  price: number[];
  todayDate: string;
  thisWeek: string;
  dateRange1: string;
  dateRange2: string;
  country: string[];
  sort: string;
  isOnline: string;
};
interface DoctorContextProps {
  doctors: Doctor[];
  isLoading: boolean;
  error: string | null;
  fetchDoctors: () => void;
}

const DoctorContext = createContext<DoctorContextProps | undefined>(undefined);

export const DoctorProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctors = async () => {
    try {
      setIsLoading(true);
            // const response = await fetch(
      //   `${process.env.NEXT_PUBLIC_SERVER_NAME}/patient/home`,
      //   {
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //   }
      // );

      // if (!response.ok) {
      //   throw new Error("Failed to fetch doctors");
      // }
      // const data = await response.json();

      const data: Doctor[] = [
        {
          id: "1",
          name: "Dr. Rajesh Kumar",
          title: "Psychiatrist",
          numSessions: 12,
          nearestApp: "2024-10-01",
          rating: 4.6,
          fees60min: 1200,
          fees30min: 700,
          numReviews: 45,
          interests: ["Depression", "Anxiety", "Stress", "Family Issues"],
          speciality: "Mental Health",
          gender: "Male",
          price: [1200, 700],
          todayDate: "2024-12-18",
          thisWeek: "2024-12-18 to 2024-12-24",
          dateRange1: "2024-12-01 to 2024-12-07",
          dateRange2: "2024-12-08 to 2024-12-14",
          country: ["India"],
          sort: "rating",
          isOnline: "Yes",
          language: ["Hindi", "Punjabi", "English"],
        },
        {
          id: "2",
          name: "Dr. Neha Sharma",
          title: "Cardiologist",
          numSessions: 18,
          nearestApp: "2024-10-05",
          rating: 4.8,
          fees60min: 1500,
          fees30min: 900,
          numReviews: 62,
          interests: ["Heart Disease", "Hypertension", "Cholesterol", "Arrhythmia"],
          speciality: "Cardiology",
          gender: "Female",
          price: [1500, 900],
          todayDate: "2024-12-18",
          thisWeek: "2024-12-18 to 2024-12-24",
          dateRange1: "2024-12-01 to 2024-12-07",
          dateRange2: "2024-12-08 to 2024-12-14",
          country: ["India"],
          sort: "nearestApp",
          isOnline: "No",
          language: ["Hindi", "Punjabi", "English"],
        },
        {
          id: "3",
          name: "Dr. Simran Kaur",
          title: "Dermatologist",
          numSessions: 20,
          nearestApp: "2024-10-10",
          rating: 4.7,
          fees60min: 1000,
          fees30min: 600,
          numReviews: 70,
          interests: ["Acne", "Eczema", "Psoriasis", "Skin Care"],
          speciality: "Dermatology",
          gender: "Female",
          price: [1000, 600],
          todayDate: "2024-12-18",
          thisWeek: "2024-12-18 to 2024-12-24",
          dateRange1: "2024-12-01 to 2024-12-07",
          dateRange2: "2024-12-08 to 2024-12-14",
          country: ["India"],
          sort: "rating",
          isOnline: "Yes",
          language: ["Punjabi", "Hindi", "English"],
        },
        {
          id: "4",
          name: "Dr. Arjun Singh",
          title: "Pediatrician",
          numSessions: 25,
          nearestApp: "2024-10-15",
          rating: 4.9,
          fees60min: 1100,
          fees30min: 700,
          numReviews: 85,
          interests: ["Child Development", "Vaccinations", "Nutrition", "Asthma"],
          speciality: "Pediatrics",
          gender: "Male",
          price: [1100, 700],
          todayDate: "2024-12-18",
          thisWeek: "2024-12-18 to 2024-12-24",
          dateRange1: "2024-12-01 to 2024-12-07",
          dateRange2: "2024-12-08 to 2024-12-14",
          country: ["India"],
          sort: "nearestApp",
          isOnline: "No",
          language: ["Hindi", "Punjabi", "English"],
        },
        {
          id: "5",
          name: "Dr. Suresh Patel",
          title: "Neurologist",
          numSessions: 18,
          nearestApp: "2024-10-20",
          rating: 4.6,
          fees60min: 1400,
          fees30min: 850,
          numReviews: 55,
          interests: ["Epilepsy", "Stroke", "Migraine", "Multiple Sclerosis"],
          speciality: "Neurology",
          gender: "Male",
          price: [1400, 850],
          todayDate: "2024-12-18",
          thisWeek: "2024-12-18 to 2024-12-24",
          dateRange1: "2024-12-01 to 2024-12-07",
          dateRange2: "2024-12-08 to 2024-12-14",
          country: ["India"],
          sort: "rating",
          isOnline: "Yes",
          language: ["Hindi", "Punjabi", "English"],
        },
        {
          id: "6",
          name: "Dr. Meena Reddy",
          title: "Endocrinologist",
          numSessions: 22,
          nearestApp: "2024-10-25",
          rating: 4.7,
          fees60min: 1300,
          fees30min: 750,
          numReviews: 65,
          interests: ["Diabetes", "Thyroid Disorders", "Hormonal Imbalances", "Obesity"],
          speciality: "Endocrinology",
          gender: "Female",
          price: [1300, 750],
          todayDate: "2024-12-18",
          thisWeek: "2024-12-18 to 2024-12-24",
          dateRange1: "2024-12-01 to 2024-12-07",
          dateRange2: "2024-12-08 to 2024-12-14",
          country: ["India"],
          sort: "nearestApp",
          isOnline: "No",
          language: ["Hindi", "Punjabi", "English"],
        },
        {
          id: "7",
          name: "Dr. Vikram Malhotra",
          title: "Orthopedic Surgeon",
          numSessions: 30,
          nearestApp: "2024-10-30",
          rating: 4.8,
          fees60min: 1600,
          fees30min: 950,
          numReviews: 75,
          interests: ["Joint Replacement", "Sports Injuries", "Arthritis", "Fractures"],
          speciality: "Orthopedics",
          gender: "Male",
          price: [1600, 950],
          todayDate: "2024-12-18",
          thisWeek: "2024-12-18 to 2024-12-24",
          dateRange1: "2024-12-01 to 2024-12-07",
          dateRange2: "2024-12-08 to 2024-12-14",
          country: ["India"],
          sort: "rating",
          isOnline: "Yes",
          language: ["Punjabi", "Hindi", "English"],
        },
        {
          id: "8",
          name: "Dr. Anjali Verma",
          title: "Gastroenterologist",
          numSessions: 28,
          nearestApp: "2024-11-05",
          rating: 4.9,
          fees60min: 1350,
          fees30min: 800,
          numReviews: 85,
          interests: ["IBS", "Liver Disease", "GERD", "Colonoscopy"],
          speciality: "Gastroenterology",
          gender: "Female",
          price: [1350, 800],
          todayDate: "2024-12-18",
          thisWeek: "2024-12-18 to 2024-12-24",
          dateRange1: "2024-12-01 to 2024-12-07",
          dateRange2: "2024-12-08 to 2024-12-14",
          country: ["India"],
          sort: "nearestApp",
          isOnline: "No",
          language: ["Hindi", "Punjabi", "English"],
        },
      ];

      setDoctors(data);
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (doctors.length === 0) {
      fetchDoctors();
    }
  }, [doctors]);

  return (
    <DoctorContext.Provider value={{ doctors, isLoading, error, fetchDoctors }}>
      {children}
    </DoctorContext.Provider>
  );
};

export const useDoctorContext = () => {
  const context = useContext(DoctorContext);
  if (!context) {
    throw new Error("useDoctorContext must be used within a DoctorProvider");
  }
  return context;
};