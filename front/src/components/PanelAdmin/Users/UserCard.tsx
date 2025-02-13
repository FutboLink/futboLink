import { IProfileData } from "@/Interfaces/IUser";
import React from "react";


interface UserCardProps {
    user:IProfileData

}
const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const {
    name,
    lastname,
    role,
    email,
    nameAgency,
    phone,
    nationality,
    location,
    genre,
    birthday,
  } = user;

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 max-w-sm hover:shadow-xl transition-shadow duration-300">
      <h3 className="text-xl font-bold text-green-600 mb-2">
        {name} {lastname}
      </h3>
      <p className="text-gray-700">
        <span className="font-semibold">Role:</span> {role}
      </p>
      <p className="text-gray-700">
        <span className="font-semibold">Email:</span> {email}
      </p>
      <p className="text-gray-700">
        <span className="font-semibold">Agency:</span> {nameAgency || "N/A"}
      </p>
      <p className="text-gray-700">
        <span className="font-semibold">Phone:</span> {phone}
      </p>
      <p className="text-gray-700">
        <span className="font-semibold">Nationality:</span> {nationality}
      </p>
      <p className="text-gray-700">
        <span className="font-semibold">Location:</span> {location}
      </p>
      <p className="text-gray-700">
        <span className="font-semibold">Genre:</span> {genre}
      </p>
      <p className="text-gray-700">
        <span className="font-semibold">Birthday:</span> {new Date(birthday).toLocaleDateString()}
      </p>
    </div>
  );
};

export default UserCard;
