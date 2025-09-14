"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import patientImage from "@/images/patient.png";
import doctorImage from "@/images/doctor.png";
import InputComponent from "./InputComponent";
import { Calendar } from "primereact/calendar";
import { format } from "date-fns"; // For formatting dates (optional)
import { useRouter } from "next/navigation";

function SignUpForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState("Patient");
  const [changedField, setChangedField] = useState("");
  const [formValid, setFormValid] = useState(false);
  const [error, setError] = useState(false);
  const [signedUp, setSignedUp] = useState(false);
  const [currCertificateId, setCurrCertificateId] = useState(1);
  const [currExperienceId, setCurrExperienceId] = useState(1);
  const [currInterestId, setCurrInterestId] = useState(1);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    birthDate: "",
    gender: "",
  });

  const [doctorCertificates, setDoctorCertificates] = useState([
    {
      id: 0,
      name: "",
      authority: "",
      startDate: "",
      endDate: "",
    },
  ]);

  const [doctorExperiences, setDoctorExperiences] = useState([
    {
      id: 0,
      title: "",
      firm: "",
      department: "",
      startDate: "",
      endDate: "",
    },
  ]);

  const [doctorInterests, setDoctorInterests] = useState([
    {
      id: 0,
      name: "",
      category: "",
    },
  ]);

  const [errorMessage, setErrorMessage] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    birthDate: "",
  });

  useEffect(() => {
    validateForm();
  }, [formData]);

  useEffect(() => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      birthDate: "",
      gender: "",
    });

    setErrorMessage({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      birthDate: "",
    });

    setDoctorCertificates([
      {
        id: 0,
        name: "",
        authority: "",
        startDate: "",
        endDate: "",
      },
    ]);

    setDoctorExperiences([
      {
        id: 0,
        title: "",
        firm: "",
        department: "",
        startDate: "",
        endDate: "",
      },
    ]);

    setDoctorInterests([
      {
        id: 0,
        name: "",
        category: "",
      },
    ]);

    setCurrCertificateId(1);
    setCurrExperienceId(1);
    setCurrInterestId(1);
  }, [userType]);

  const formFields = [
    { name: "firstName", title: "First Name", type: "text" },
    { name: "lastName", title: "Last Name", type: "text" },
    { name: "email", title: "Email", type: "email" },
    { name: "phone", title: "Phone Number", type: "tel" },
    { name: "password", title: "Password", type: "password" },
    { name: "confirmPassword", title: "Confirm Password", type: "password" },
    { name: "birthDate", title: "Birth Date", type: "number" },
  ];

  const submitButtonClass = [
    "bg-sky-500 text-neutral-50 text-lg	p-3.5	w-full border-none rounded-lg cursor-pointer transition-[background-color]",
    "disabled:bg-neutral-300 disabled:text-neutral-700 disabled:cursor-not-allowed enabled:bg-sky-500",
  ].join(" ");

  const validateFieldsChosen = () => {
    for (let key in formData) {
      if (!formData[key as keyof typeof formData]) {
        return false;
      }
    }
    return true;
  };

  const validateFirstName = () => {
    let regex = /^[a-zA-Z]+$/;
    let changedValidation = false;

    if (formData.firstName && !regex.test(formData.firstName)) {
      if (errorMessage.firstName === "") {
        changedValidation = true;
      }
      setErrorMessage((prevError) => ({
        ...prevError,
        firstName: "First Name Must Consist Of Only Characters",
      }));
    } else {
      if (errorMessage.firstName !== "") {
        changedValidation = true;
      }
      setErrorMessage((prevError) => ({ ...prevError, firstName: "" }));
    }

    if (changedValidation && validateFieldsChosen()) {
      setFormData((prevForm) => ({ ...prevForm })); // Extra rerender needed to correct the current input error status
    }
  };

  const validateLastName = () => {
    let regex = /^[a-zA-Z]+$/;
    let changedValidation = false;
    if (formData.lastName && !regex.test(formData.lastName)) {
      if (errorMessage.lastName === "") {
        changedValidation = true;
      }
      setErrorMessage((prevError) => ({
        ...prevError,
        lastName: "Last Name Must Consist Of Only Characters",
      }));
    } else {
      if (errorMessage.lastName !== "") {
        changedValidation = true;
      }
      setErrorMessage((prevError) => ({ ...prevError, lastName: "" }));
    }

    if (changedValidation && validateFieldsChosen()) {
      setFormData((prevForm) => ({ ...prevForm }));
    }
  };

  const validateEmail = () => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let changedValidation = false;
    if (formData.email && !emailPattern.test(formData.email)) {
      if (errorMessage.email === "") {
        changedValidation = true;
      }
      setErrorMessage((prevError) => ({
        ...prevError,
        email: "Email Is Invalid",
      }));
    } else {
      if (errorMessage.email !== "") {
        changedValidation = true;
      }
      setErrorMessage((prevError) => ({ ...prevError, email: "" }));
    }

    if (changedValidation && validateFieldsChosen()) {
      setFormData((prevForm) => ({ ...prevForm }));
    }
  };

  const validatePassword = () => {
    let passwordPattern =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    let changedValidation = false;
    if (
      !formData.password ||
      (formData.password && passwordPattern.test(formData.password))
    ) {
      if (errorMessage.password !== "") {
        changedValidation = true;
      }
      setErrorMessage((prevError) => ({ ...prevError, password: "" }));
    } else {
      if (errorMessage.password === "") {
        changedValidation = true;
      }
      setErrorMessage((prevError) => ({
        ...prevError,
        password:
          "Password Must Contain 8+ Characters Including Atleast 1 Number, 1 Character, 1 Symbol",
      }));
    }

    if (changedValidation && validateFieldsChosen()) {
      setFormData((prevForm) => ({ ...prevForm }));
    }
  };

  const validateConfirmPassword = () => {
    let changedValidation = false;

    if (
      formData.confirmPassword &&
      formData.confirmPassword !== formData.password
    ) {
      if (errorMessage.confirmPassword === "") {
        changedValidation = true;
      }
      setErrorMessage((prevError) => ({
        ...prevError,
        confirmPassword: "Passwords Don't Match",
      }));
    } else {
      if (errorMessage.confirmPassword !== "") {
        changedValidation = true;
      }
      setErrorMessage((prevError) => ({ ...prevError, confirmPassword: "" }));
    }

    if (changedValidation && validateFieldsChosen()) {
      setFormData((prevForm) => ({ ...prevForm }));
    }
  };

  const validatePhone = () => {
    // Allow optional leading + and 7-15 digits total
    const phonePattern = /^\+?\d{7,15}$/;
    let changedValidation = false;
    if (formData.phone && !phonePattern.test(formData.phone)) {
      if (errorMessage.phone === "") {
        changedValidation = true;
      }
      setErrorMessage((prevError) => ({
        ...prevError,
        phone: "Phone number must be 7-15 digits, optional leading +",
      }));
    } else {
      if (errorMessage.phone !== "") {
        changedValidation = true;
      }
      setErrorMessage((prevError) => ({ ...prevError, phone: "" }));
    }

    if (changedValidation && validateFieldsChosen()) {
      setFormData((prevForm) => ({ ...prevForm }));
    }
  };

  const handleDateChange = (e: any) => {
    // PrimeReact Calendar returns selected date on e.value
    const value = e?.value ?? null;
    setFormData((prevForm) => ({
      ...prevForm,
      birthDate: value,
    }));
    setChangedField(() => "birthDate");
  };
  const validateBirthDate = () => {
    let changedValidation = false;

    if (formData.birthDate) {
      const selectedDate = new Date(formData.birthDate);
      const today = new Date();
      let age = today.getFullYear() - selectedDate.getFullYear();
      const m = today.getMonth() - selectedDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < selectedDate.getDate())) {
        age--;
      }

      if (age < 13) {
        // Example: User must be at least 13 years old
        if (errorMessage.birthDate === "") {
          changedValidation = true;
        }
        setErrorMessage((prevError) => ({
          ...prevError,
          birthDate: "You must be at least 13 years old.",
        }));
      } else {
        if (errorMessage.birthDate !== "") {
          changedValidation = true;
        }
        setErrorMessage((prevError) => ({ ...prevError, birthDate: "" }));
      }
    } else {
      if (errorMessage.birthDate === "") {
        changedValidation = true;
      }
      setErrorMessage((prevError) => ({
        ...prevError,
        birthDate: "Birth Date is required.",
      }));
    }

    if (changedValidation && validateFieldsChosen()) {
      setFormData((prevForm) => ({ ...prevForm }));
    }
  };

  const validateForm = () => {
    switch (changedField) {
      case "firstName":
        validateFirstName();
        break;

      case "lastName":
        validateLastName();
        break;

      case "email":
        validateEmail();
        break;

      case "password":
        validatePassword();
        validateConfirmPassword();
        break;

      case "confirmPassword":
        validateConfirmPassword();
        break;

      case "phone":
        validatePhone();
        break;

      case "birthDate":
        validateBirthDate();
        break;

      default:
        break;
    }

    setChangedField(() => "");

    if (validateFieldsChosen()) {
      for (let key in errorMessage) {
        if (errorMessage[key as keyof typeof errorMessage] !== "") {
          setFormValid(() => false);
          return;
        }
      }
      setFormValid(() => true);
    } else {
      setFormValid(() => false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
    setChangedField(() => name);
  };

  const handleAddCertificate = (e: React.MouseEvent<HTMLButtonElement>) => {
    setCurrCertificateId((prevId) => prevId + 1);
    let currCertificates = doctorCertificates;
    currCertificates.push({
      id: currCertificateId,
      name: "",
      authority: "",
      startDate: "",
      endDate: "",
    });
    setDoctorCertificates(() => currCertificates);
  };

  const handleDeleteCertificate = (id: Number) => {
    setCurrCertificateId((prevId) => prevId + 1);
    let currCertificates = [];
    for (let i = 0; i < doctorCertificates.length; i++) {
      if (doctorCertificates[i].id === id) {
        continue;
      }
      currCertificates.push(doctorCertificates[i]);
    }
    setDoctorCertificates(() => currCertificates);
  };

  const handleCertificateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, placeholder, value } = e.target;
    let currCertificates = doctorCertificates;
    for (let i = 0; i < currCertificates.length; i++) {
      if (
        currCertificates[i].id + 1 ===
        Number(placeholder[placeholder.length - 1])
      ) {
        if (name === "name") {
          currCertificates[i].name = value;
        } else if (name === "authority") {
          currCertificates[i].authority = value;
        } else if (name === "startDate") {
          currCertificates[i].startDate = value;
        } else if (name === "endDate") {
          currCertificates[i].endDate = value;
        }
        break;
      }
    }
    setDoctorCertificates(() => currCertificates);
    setFormData((prevForm) => ({ ...prevForm }));
  };

  const handleAddExperience = (e: React.MouseEvent<HTMLButtonElement>) => {
    setCurrExperienceId((prevId) => prevId + 1);
    let currExperiences = doctorExperiences;
    currExperiences.push({
      id: currExperienceId,
      title: "",
      firm: "",
      department: "",
      startDate: "",
      endDate: "",
    });
    setDoctorExperiences(() => currExperiences);
  };

  const handleDeleteExperience = (id: Number) => {
    setCurrExperienceId((prevId) => prevId + 1);
    let currExperiences = [];
    for (let i = 0; i < doctorExperiences.length; i++) {
      if (doctorExperiences[i].id === id) {
        continue;
      }
      currExperiences.push(doctorExperiences[i]);
    }
    setDoctorExperiences(() => currExperiences);
  };

  const handleExperienceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, placeholder, value } = e.target;
    let currExperiences = doctorExperiences;
    for (let i = 0; i < currExperiences.length; i++) {
      if (
        currExperiences[i].id + 1 ===
        Number(placeholder[placeholder.length - 1])
      ) {
        if (name === "title") {
          currExperiences[i].title = value;
        } else if (name === "firm") {
          currExperiences[i].firm = value;
        } else if (name === "department") {
          currExperiences[i].department = value;
        } else if (name === "startDate") {
          currExperiences[i].startDate = value;
        } else if (name === "endDate") {
          currExperiences[i].endDate = value;
        }
        break;
      }
    }
    setDoctorExperiences(() => currExperiences);
    setFormData((prevForm) => ({ ...prevForm }));
  };

  const handleAddInterest = (e: React.MouseEvent<HTMLButtonElement>) => {
    setCurrInterestId((prevId) => prevId + 1);
    let currInterests = doctorInterests;
    currInterests.push({
      id: currInterestId,
      name: "",
      category: "",
    });
    setDoctorInterests(() => currInterests);
  };

  const handleDeleteInterest = (id: Number) => {
    setCurrInterestId((prevId) => prevId + 1);
    let currInterests = [];
    for (let i = 0; i < doctorInterests.length; i++) {
      if (doctorInterests[i].id === id) {
        continue;
      }
      currInterests.push(doctorInterests[i]);
    }
    setDoctorInterests(() => currInterests);
  };

  const handleInterestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, placeholder, value } = e.target;
    let currInterests = doctorInterests;
    for (let i = 0; i < currInterests.length; i++) {
      if (
        currInterests[i].id + 1 ===
        Number(placeholder[placeholder.length - 1])
      ) {
        if (name === "name") {
          currInterests[i].name = value;
        } else if (name === "category") {
          currInterests[i].category = value;
        }
        break;
      }
    }
    setDoctorInterests(() => currInterests);
    setFormData((prevForm) => ({ ...prevForm }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (!formValid) {
      console.warn("Signup form invalid; aborting submit", { formData, errorMessage });
      setLoading(false);
      return;
    }
    const API_BASE =
      process.env.NEXT_PUBLIC_SERVER_NAME || "http://localhost:4000";
    const endpoint =
      userType === "Patient"
        ? `${API_BASE}/patient/register`
        : `${API_BASE}/doctor/register`;

    const payload =
      userType === "Patient"
        ? {
            fName: formData.firstName,
            lName: formData.lastName,
            email: formData.email,
            password: formData.password,
            gender: formData.gender,
            phone: formData.phone,
            birthDate: formData.birthDate
              ? format(new Date(formData.birthDate), "yyyy-MM-dd")
              : null,
          }
        : {
            personalInfo: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              birthdate: formData.birthDate
                ? format(new Date(formData.birthDate), "yyyy-MM-dd")
                : null,
              city: "",
              country: "",
              email: formData.email,
              gender: formData.gender,
              location: "",
              password: formData.password,
              phone: formData.phone,
              speciality: "",
            },
            certificates: doctorCertificates,
            experiences: doctorExperiences,
            interests: doctorInterests,
            Languages: [],
          };

    try {
      console.log("Submitting signup to:", endpoint, "payload:", payload);
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        mode: "cors",
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        throw new Error(
          `Failed to register (${response.status}) ${errText || ""}`.trim()
        );
      }

      const data = await response.json();
      console.log("Signup success:", data);

      // Persist minimal info for logged-in experience if needed
      if (userType === "Patient" && data?.patient) {
        const p = data.patient;
        localStorage.setItem(
          "registeredUser",
          JSON.stringify({
            firstName: p.user_first_name,
            lastName: p.user_last_name,
            email: p.user_email,
            phone: p.user_phone_number,
            gender: p.user_gender,
            birthDate: p.user_birth_date,
            id: p.user_id,
          })
        );
      }

      setError(false);
      setSignedUp(true);
      setLoading(false);
      router.replace("/");
    } catch (error: any) {
      console.error("Error During Signup:", error?.message || error);
      setSignedUp(false);
      setError(true);
      setLoading(false);
    }
  };

  // Dev-only quick test to verify endpoint wiring without form validation
  const devQuickTest = async () => {
    const API_BASE = process.env.NEXT_PUBLIC_SERVER_NAME || "http://localhost:4000";
    const endpoint = `${API_BASE}/patient/register`;
    const payload = {
      fName: "Dev",
      lName: "Tester",
      email: `patient_auto_${Date.now()}@test.com`,
      password: "test@123!",
      gender: "Male",
      phone: "+521234567890",
      birthDate: "1994-03-28",
    };
    try {
      console.log("[DEV] Quick test POST →", endpoint, payload);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        mode: "cors",
      });
      const text = await res.text();
      console.log("[DEV] Quick test response:", res.status, text);
      if (!res.ok) alert(`Quick test failed: ${res.status} ${text}`);
      else alert(`Quick test OK: ${text}`);
    } catch (err: any) {
      console.error("[DEV] Quick test error:", err?.message || err);
      alert(`Quick test error: ${err?.message || err}`);
    }
  };

  const patientImageClass = `w-20 h-20 border-2 border-solid rounded-full ${
    userType === "Patient" ? "border-blue-500" : ""
  } hover:cursor-pointer hover:scale-105`;
  const patientTextClass = `font-bold ${
    userType === "Patient" ? "text-blue-500" : "text-neutral-700"
  }`;
  const doctorImageClass = `w-20 h-20 border-2 border-solid rounded-full ${
    userType === "Doctor" ? "border-blue-500" : ""
  } hover:cursor-pointer hover:scale-105`;
  const doctorTextClass = `font-bold ${
    userType === "Doctor" ? "text-blue-500" : "text-neutral-700"
  }`;

  return (
    <div className="p-5 rounded-xl max-w-md m-auto h-screen overflow-y-hidden hover:overflow-y-scroll">
      <h2 className="font-bold text-2xl text-center text-neutral-700 mb-6">
        Sign Up
      </h2>
      <div className="flex gap-8 items-center justify-center my-2">
        <div className="flex flex-col gap-2 items-center">
          <Image
            src={patientImage}
            alt="Patient Image"
            className={patientImageClass}
            onClick={() => setUserType(() => "Patient")}
          />
          <p className={patientTextClass}>Patient</p>
        </div>
        <div className="flex flex-col gap-2 items-center">
          <Image
            src={doctorImage}
            alt="Doctor Image"
            className={doctorImageClass}
            onClick={() => setUserType(() => "Doctor")}
          />
          <p className={doctorTextClass}>Doctor</p>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        {formFields.map((field) => {
          return (
            <>
              {field.name === "birthDate" ? (
                <>
                  <label className="block text-base mb-1.5 font-semibold text-neutral-700">
                    {field.title} *
                  </label>
                  <div className="calendar-container relative ">
                    <Calendar
                      value={
                        formData.birthDate ? new Date(formData.birthDate) : null
                      }
                      onChange={handleDateChange}
                      showIcon
                      dateFormat="yy-mm-dd"
                      placeholder="Select your birth date (yyyy-mm-dd)"
                      maxDate={new Date()}
                      yearRange={`1900:${new Date().getFullYear()}`}
                      className={`bg-neutral-100 w-full py-4 px-6 text-base rounded-lg border border-solid border-neutral-300 grey-100 outline-none transition-[border-color] focus:border-sky-500 focus:bg-neutral-50 ${
                        errorMessage.birthDate ? "p-invalid" : ""
                      }`}
                      panelClassName="bg-white" // Custom class to set the background of the calendar popup
                    />
                    {errorMessage.birthDate && (
                      <small className="text-xs mt-1 text-red-700 font-semibold">
                        {errorMessage.birthDate}
                      </small>
                    )}
                  </div>
                </>
              ) : (
                <InputComponent
                  key={field.name}
                  label={field.title}
                  type={field.type}
                  name={field.name}
                  placeholder={
                    field.name === "phone" && !formData.phone
                      ? "+91 XXXX XXX XXX"
                      : `Enter ${field.title}`
                  }
                  value={formData[field.name as keyof typeof formData]}
                  onChange={handleChange}
                  errorText={
                    errorMessage[field.name as keyof typeof errorMessage]
                  }
                  required
                  additionalText={
                    field.name === "phone" && !errorMessage.phone
                      ? "Please Enter A Valid Phone Number"
                      : ""
                  }
                />
              )}
            </>
          );
        })}
        <div className="mb-4">
          <label className="block text-base mb-1.5 font-semibold text-neutral-700">
            Gender *
          </label>
          <div className="flex gap-8">
            <label>
              <input
                type="radio"
                name="gender"
                value="Male"
                onChange={handleChange}
                className="radio align-middle mb-[3px] mr-1"
                checked={formData.gender === "Male"}
                required
              />
              Male
            </label>
            <label>
              <input
                type="radio"
                name="gender"
                value="Female"
                onChange={handleChange}
                className="radio align-middle mb-[3px] mr-1"
                checked={formData.gender === "Female"}
              />
              Female
            </label>
          </div>
        </div>
        {userType === "Doctor" ? (
          <>
            <div className="mb-4 relative border-2 border-blue-400 rounded-lg">
              <div className="flex justify-between items-center mb-3 p-3">
                <button
                  className="flex gap-2 rounded-xl border-2 p-2 mb-1 border-green-500 hover:bg-green-100 transition-colors"
                  onClick={handleAddCertificate}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6 stroke-green-500"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                  <p className="text-green-500 font-bold">Add Certificate</p>
                </button>
                <p className="font-semibold text-xl">Certificates</p>
              </div>
              {doctorCertificates.map((certificate) => {
                return (
                  <div
                    key={certificate.id}
                    className="p-2 border-t-4 border-blue-400"
                  >
                    <InputComponent
                      label="Certificate Name"
                      type="text"
                      name="name"
                      placeholder={
                        "Enter The Name Of Certificate Number " +
                        (certificate.id + 1)
                      }
                      value={certificate.name}
                      onChange={handleCertificateChange}
                      required
                    />
                    <InputComponent
                      label="Certificate Authority"
                      type="text"
                      name="authority"
                      placeholder={
                        "Enter The Authority Of Certificate Number " +
                        (certificate.id + 1)
                      }
                      value={certificate.authority}
                      onChange={handleCertificateChange}
                      required
                    />
                    <InputComponent
                      label="Certificate Start Date"
                      type="text"
                      name="startDate"
                      placeholder={
                        "Enter The Start Date Of Certificate Number " +
                        (certificate.id + 1)
                      }
                      value={certificate.startDate}
                      onChange={handleCertificateChange}
                      required
                    />
                    <InputComponent
                      label="Certificate End Date"
                      type="text"
                      name="endDate"
                      placeholder={
                        "Enter The End Date Of Certificate Number " +
                        (certificate.id + 1)
                      }
                      value={certificate.endDate}
                      onChange={handleCertificateChange}
                      required
                    />
                    <button
                      className="flex gap-2 rounded-xl border-2 p-2 mb-1 border-red-500 hover:bg-red-100 transition-colors"
                      onClick={() => handleDeleteCertificate(certificate.id)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-6 stroke-red-500"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 12h14"
                        />
                      </svg>
                      <p className="text-red-500 font-bold">
                        Delete Certificate
                      </p>
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="mb-4 relative border-2 border-blue-400 rounded-lg">
              <div className="flex justify-between items-center mb-3 p-3">
                <button
                  className="flex gap-2 rounded-xl border-2 p-2 mb-1 border-green-500 hover:bg-green-100 transition-colors"
                  onClick={handleAddExperience}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6 stroke-green-500"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                  <p className="text-green-500 font-bold">Add Experience</p>
                </button>
                <p className="font-semibold text-xl">Experiences</p>
              </div>
              {doctorExperiences.map((experience) => {
                return (
                  <div
                    key={experience.id}
                    className="p-2 border-t-4 border-blue-400"
                  >
                    <InputComponent
                      label="Experience Title"
                      type="text"
                      name="title"
                      placeholder={
                        "Enter The Title Of Experience Number " +
                        (experience.id + 1)
                      }
                      value={experience.title}
                      onChange={handleExperienceChange}
                      required
                    />
                    <InputComponent
                      label="Experience Firm"
                      type="text"
                      name="firm"
                      placeholder={
                        "Enter The Firm Of Experience Number " +
                        (experience.id + 1)
                      }
                      value={experience.firm}
                      onChange={handleExperienceChange}
                      required
                    />
                    <InputComponent
                      label="Experience Department"
                      type="text"
                      name="department"
                      placeholder={
                        "Enter The Department Of Experience Number " +
                        (experience.id + 1)
                      }
                      value={experience.department}
                      onChange={handleExperienceChange}
                      required
                    />
                    <InputComponent
                      label="Experience Start Date"
                      type="text"
                      name="startDate"
                      placeholder={
                        "Enter The Start Date Of Experience Number " +
                        (experience.id + 1)
                      }
                      value={experience.startDate}
                      onChange={handleExperienceChange}
                      required
                    />
                    <InputComponent
                      label="Experience End Date"
                      type="text"
                      name="endDate"
                      placeholder={
                        "Enter The End Date Of Experience Number " +
                        (experience.id + 1)
                      }
                      value={experience.endDate}
                      onChange={handleExperienceChange}
                      required
                    />
                    <button
                      className="flex gap-2 rounded-xl border-2 p-2 mb-1 border-red-500 hover:bg-red-100 transition-colors"
                      onClick={() => handleDeleteExperience(experience.id)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-6 stroke-red-500"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 12h14"
                        />
                      </svg>
                      <p className="text-red-500 font-bold">
                        Delete Experience
                      </p>
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="mb-4 relative border-2 border-blue-400 rounded-lg">
              <div className="flex justify-between items-center mb-3 p-3">
                <button
                  className="flex gap-2 rounded-xl border-2 p-2 mb-1 border-green-500 hover:bg-green-100 transition-colors"
                  onClick={handleAddInterest}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6 stroke-green-500"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                  <p className="text-green-500 font-bold">Add Interest</p>
                </button>
                <p className="font-semibold text-xl">Interests</p>
              </div>
              {doctorInterests.map((interest) => {
                return (
                  <div
                    key={interest.id}
                    className="p-2 border-t-4 border-blue-400"
                  >
                    <InputComponent
                      label="Interest Name"
                      type="text"
                      name="name"
                      placeholder={
                        "Enter The Name Of Interest Number " + (interest.id + 1)
                      }
                      value={interest.name}
                      onChange={handleInterestChange}
                      required
                    />
                    <InputComponent
                      label="Interest Categoryty"
                      type="text"
                      name="category"
                      placeholder={
                        "Enter The Category Of Interest Number " +
                        (interest.id + 1)
                      }
                      value={interest.category}
                      onChange={handleInterestChange}
                      required
                    />
                    <button
                      className="flex gap-2 rounded-xl border-2 p-2 mb-1 border-red-500 hover:bg-red-100 transition-colors"
                      onClick={() => handleDeleteInterest(interest.id)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-6 stroke-red-500"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 12h14"
                        />
                      </svg>
                      <p className="text-red-500 font-bold">Delete Interest</p>
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <></>
        )}
        <p className="mb-2">
          Already have an account?{" "}
          <Link
            href="/auth/signin"
            className="text-blue-500 font-semibold cursor-pointer"
          >
            Sign in
          </Link>
        </p>
        {error && (
          <p className="font-semibold text-red-700 mt-4 mb-2">
            This Email Is Already Registered!
          </p>
        )}
        {signedUp && (
          <p className="font-semibold text-green-700 mt-4 mb-2">
            Signed up successfully!
          </p>
        )}
        <button
          type="submit"
          className={`${submitButtonClass} disabled:cursor-not-allowed disabled:opacity-50 mb-14`}
          disabled={!formValid || loading}
        >
          {loading ? "Loading..." : "Register"}
        </button>
        {process.env.NODE_ENV !== 'production' && (
          <button
            type="button"
            onClick={devQuickTest}
            className="w-full mb-6 py-3 rounded-lg bg-neutral-200 text-neutral-800 hover:bg-neutral-300"
          >
            DEV: Quick POST to /patient/register
          </button>
        )}
        {process.env.NODE_ENV !== 'production' && (
          <details className="mb-10">
            <summary className="cursor-pointer text-sm text-neutral-600">Debug (dev only)</summary>
            <pre className="text-xs bg-neutral-100 p-2 rounded overflow-x-auto">
{JSON.stringify({ formValid, loading, errorMessage, filled: {
  firstName: !!formData.firstName,
  lastName: !!formData.lastName,
  email: !!formData.email,
  password: !!formData.password,
  confirmPassword: !!formData.confirmPassword,
  phone: !!formData.phone,
  birthDate: !!formData.birthDate,
  gender: !!formData.gender,
}}, null, 2)}
            </pre>
          </details>
        )}
      </form>
    </div>
  );
}

export default SignUpForm;
