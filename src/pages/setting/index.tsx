import { CloseOutlined } from "@ant-design/icons";
import { Button, Divider } from "antd";
import { motion } from "motion/react";
import React from "react";
import { useNavigate } from "react-router-dom";

import BasicSettings from "./components/BasicSettings";
import ModelSelector from "./components/ModelSelector";
import "./index.scss";

const Setting: React.FC = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate("/");
  };

  return (
    <motion.div
      animate={{
        clipPath: "circle(150% at 0% 100%)",
      }}
      className="setting-overlay"
      exit={{
        clipPath: "circle(0% at 0% 100%)",
      }}
      initial={{
        clipPath: "circle(0% at 0% 100%)",
      }}
      transition={{
        duration: 0.5,
        ease: "easeInOut",
      }}
    >
      <div className="setting-container">
        <Button
          className="close-button"
          icon={<CloseOutlined />}
          onClick={handleClose}
          type="text"
        />
        <div className="setting-content">
          <BasicSettings />
          <Divider className="section-divider" />
          <ModelSelector />
        </div>
      </div>
    </motion.div>
  );
};

export default Setting;
