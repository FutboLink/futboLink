"use client";

import Head from "next/head";
import About from "@/components/AboutUs/about";
import Clients from "@/components/Clients/client";
import Contact from "@/components/Contact/contact";
import HorizontalDiv from "@/components/HorizontalDiv/line";
import Home from "@/components/home/home";
import LogoCarousel from "@/components/LogoCarousel/LogoCarousel";

export default function HomePage() {
	return (
		<div className="min-h-screen">
			<Head>
				<title>
					Futbolink - La plataforma líder de oportunidades en el mundo del
					fútbol
				</title>
				<meta
					name="description"
					content="Futbolink es la plataforma profesional que conecta talento y oportunidades en el mundo del fútbol. Descubre cómo Futbolink puede impulsar tu carrera deportiva."
				/>
				<meta
					name="keywords"
					content="futbolink, fútbol, empleo deportivo, oportunidades futbolink, reclutamiento deportivo, futbolink plataforma"
				/>
			</Head>

			{/* Hero Section */}
			<Home />

			{/* Logo Carousel */}
			<LogoCarousel />

			{/* Divider */}
			<HorizontalDiv />

			{/* What is Futbolink Section */}
			<div className="bg-white py-16">
				<div className="container mx-auto px-4">
					<div className="text-center mb-12">
						<h2 className="text-3xl md:text-4xl font-bold text-green-700 mb-4">
							¿Qué es Futbolink?
						</h2>
						<p className="text-xl text-gray-600 max-w-3xl mx-auto">
							Futbolink es la plataforma profesional que conecta talento y
							oportunidades en el mundo del fútbol
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<div className="bg-green-50 p-6 rounded-lg shadow text-center">
							<h3 className="text-xl font-semibold text-green-700 mb-3">
								Futbolink para Jugadores
							</h3>
							<p className="text-gray-700">
								Crea tu perfil profesional en Futbolink, destaca tus habilidades
								y conéctate con clubes y representantes de todo el mundo.
							</p>
						</div>
						<div className="bg-green-50 p-6 rounded-lg shadow text-center">
							<h3 className="text-xl font-semibold text-green-700 mb-3">
								Futbolink para Clubes
							</h3>
							<p className="text-gray-700">
								Encuentra talento verificado que se ajusta a tus necesidades.
								Con Futbolink, el proceso de reclutamiento es más eficiente.
							</p>
						</div>
						<div className="bg-green-50 p-6 rounded-lg shadow text-center">
							<h3 className="text-xl font-semibold text-green-700 mb-3">
								Futbolink para Representantes
							</h3>
							<p className="text-gray-700">
								Amplía tu red de contactos y descubre nuevos talentos. Futbolink
								te conecta con jugadores que buscan representación.
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* About Us */}
			<About />

			{/* Testimonials */}
			<Clients />

			{/* Contact */}
			<Contact />
		</div>
	);
}
