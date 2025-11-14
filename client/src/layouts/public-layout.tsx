import React from "react";
import Navbar from "../components/navbar/navbar";

import {
  FaGithub,
  FaLinkedin,
  FaReact,
  FaNodeJs,
  FaCheckCircle,
} from "react-icons/fa";
import { SiTypescript, SiExpress, SiMongodb } from "react-icons/si";
import { Link } from "react-router";

const CONFIG = {
  author: {
    name: "Sahil Verma",
    tagline: "Full-Stack Developer • Building Modern Web Apps",
    description:
      "This project integrates Trello’s API to showcase boards, tasks, and user information. Fully built by me with scalable architecture and clean code.",
  },

  socials: [
    {
      name: "GitHub",
      icon: <FaGithub size={24} />,
      url: "https://github.com/sahil1000verma",
    },
    {
      name: "LinkedIn",
      icon: <FaLinkedin size={24} />,
      url: "https://www.linkedin.com/in/sahil1000verma",
    },
  ],

  techStack: [
    { name: "React", icon: <FaReact size={40} color="#61DBFB" /> },
    { name: "Node.js", icon: <FaNodeJs size={40} color="#68A063" /> },
    { name: "Express", icon: <SiExpress size={40} /> },
    { name: "TypeScript", icon: <SiTypescript size={40} color="#3178C6" /> },
    { name: "MongoDB", icon: <SiMongodb size={40} color="#4EA94B" /> },
  ],

  features: [
    {
      title: "Trello Login System",
      description:
        "Secure OAuth authentication with Trello using server-side validation.",
      icon: <FaCheckCircle size={26} className="text-green-600" />,
    },
    {
      title: "View Boards",
      description: "List all Trello boards with clean UI and fast response.",
      icon: <FaCheckCircle size={26} className="text-blue-600" />,
    },
    {
      title: "User Profile",
      description: "Display Trello account info, avatar, name, and initials.",
      icon: <FaCheckCircle size={26} className="text-purple-600" />,
    },
    {
      title: "Config Driven UI",
      description:
        "Easily add new features and technologies with a single config file.",
      icon: <FaCheckCircle size={26} className="text-orange-600" />,
    },
  ],
};

const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-16 text-center">
        {/* Intro Section */}
        <h1 className="text-4xl font-bold mb-3">{CONFIG.author.name}</h1>
        <p className="text-lg text-gray-600 mb-6">{CONFIG.author.tagline}</p>
        <p className="max-w-2xl mx-auto text-gray-700 mb-8">
          {CONFIG.author.description}
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-4 mb-12">
          {CONFIG.socials.map((s) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-100 transition"
            >
              {s.icon}
              {s.name}
            </a>
          ))}

          <Link
            to="/me/boards"
            className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            View My Trello Boards
          </Link>
        </div>

        {/* Features Section */}
        <h2 className="text-2xl font-semibold mb-6">Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-14">
          {CONFIG.features.map((feature) => (
            <div
              key={feature.title}
              className="p-5 border rounded-lg shadow-sm hover:shadow-md transition bg-white"
            >
              <div className="flex justify-center mb-3">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Tech Stack Section */}
        <h2 className="text-2xl font-semibold mb-6">Tech Stack</h2>

        <div className="flex justify-center gap-10 flex-wrap">
          {CONFIG.techStack.map((tech) => (
            <div key={tech.name} className="flex flex-col items-center">
              {tech.icon}
              <p className="text-sm mt-2">{tech.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PublicLayout;
