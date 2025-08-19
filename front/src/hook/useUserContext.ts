import { useContext } from "react";
import { UserContext } from "@/components/Context/UserContext";

export const useUserContext = () => useContext(UserContext);
