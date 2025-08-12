// components/layout/NavbarSidebarLayout.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import {
	FaCog,
	FaDumbbell,
	FaEdit,
	FaHome,
	FaNewspaper,
	FaQuestionCircle,
	FaRocket,
	FaSearch,
	FaSignOutAlt,
	FaUser,
} from "react-icons/fa";
import { useUserContext } from "@/hook/useUserContext";
import NewNavbar from "../navbar/newNavbar";

interface NavbarSidebarLayoutProps {
	children: ReactNode;
}

const NavbarSidebarLayout = ({ children }: NavbarSidebarLayoutProps) => {
	const pathname = usePathname();
	const router = useRouter();
	const { isLogged, role, setToken, setUser, user } = useUserContext();

	const handleLogout = () => {
		setToken(null);
		setUser(null);
		router.push("/Login");
	};

	//   if (!isLogged || !role) {
	//     return (
	//       <div className="flex items-center justify-center h-screen text-gray-700">
	//         <p>No estás logueado.</p>
	//       </div>
	//     );
	//   }

	const sidebarItems = [
		{ label: "Inicio", path: "/", icon: <FaHome /> },
		{ label: "Perfil", path: `/user-viewer/${user?.id}`, icon: <FaUser /> },
		{
			label: "Editar Perfil",
			path: `/user-viewer/${user?.id}?edit=true`,
			icon: <FaEdit />,
		},
		{ label: "Mercado", path: "/jobs", icon: <FaSearch /> },
		{ label: "Noticias", path: "/News", icon: <FaNewspaper /> },
		{ label: "Entrenamiento", path: "/cursos", icon: <FaDumbbell /> },
		{ label: "Ayuda", path: "/Help", icon: <FaQuestionCircle /> },
		{
			label: "Configuración",
			path: `/forgotPassword?email=${encodeURIComponent(user?.email || "")}`,
			icon: <FaCog />,
		},
	];

	if (role === "PLAYER" || role === "RECRUITER") {
		sidebarItems.push({
			label: "Mejorar Perfil",
			path: "/Subs",
			icon: <FaRocket />,
		});
	}

	return (
		<div className="flex flex-col min-h-screen">
			{/* Navbar */}
			<NewNavbar />

			<div className="flex flex-1 overflow-hidden">
				{isLogged && (
					<>
						{/* Sidebar */}
						<aside
							className="group fixed top-0 left-0 h-screen z-20
  transition-all duration-300 ease-in-out
  max-w-[80px] hover:max-w-[256px] bg-white border-r border-gray-200 px-3 hover:px-6 py-8 mt-20
  shadow-md flex flex-col overflow-hidden"
						>
							{/* Título */}
							<div className="mb-10 overflow-hidden">
								<h2
									className="text-xl font-semibold text-verde-oscuro
      opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150"
								>
									Mi Panel
								</h2>
								<div
									className="h-1 w-0 bg-verde-oscuro mt-1 rounded
      group-hover:w-10 transition-all duration-300 delay-150"
								/>
							</div>

							{/* Ítems */}
							<nav className="flex flex-col gap-2">
								{sidebarItems.map((item) => {
									const isActive = pathname === item.path;
									return (
										<Link
											key={item.path}
											href={item.path}
											className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
												isActive
													? "bg-verde-oscuro text-white shadow"
													: "text-gray-700 hover:bg-gray-100"
											}`}
										>
											<span className="text-lg">{item.icon}</span>
											<span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150">
												{item.label}
											</span>
										</Link>
									);
								})}

								{/* Logout */}
								<button
									onClick={handleLogout}
									className="mt-4 flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
									type="button"
								>
									<FaSignOutAlt />
									<span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150">
										Cerrar sesión
									</span>
								</button>
							</nav>
						</aside>
					</>
				)}

				{/* Main content */}
				<main className="flex-1 overflow-y-auto  bg-gray-50 pl-[80px] group-hover:pl-[256px] transition-all duration-300">
					{children}
				</main>
			</div>
		</div>
	);
};

export default NavbarSidebarLayout;
