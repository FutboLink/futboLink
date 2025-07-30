import { UserContext } from "@/components/Context/UserContext";
import { useContext } from "react";

export const useUserContext = () => useContext(UserContext);
