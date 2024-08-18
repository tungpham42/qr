import React, { useState, useRef } from "react";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { QRCodeCanvas } from "qrcode.react";
import { toPng } from "html-to-image";

const QRCodeGenerator = () => {
  const [inputValue, setInputValue] = useState("");
  const [qrValue, setQRValue] = useState("");
  const [size, setSize] = useState(256); // Default size is 256x256
  const qrRef = useRef(null);

  const handleGenerate = () => {
    setQRValue(inputValue);
  };

  const handleDownload = () => {
    if (qrRef.current === null) {
      return;
    }
    toPng(qrRef.current)
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = `qr-code-${size}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error("Error generating image:", err);
      });
  };

  return (
    <Container>
      <Row className="justify-content-md-center mt-5">
        <Col md={6}>
          <h1>QR Code Generator</h1>
          <Form>
            <Form.Group controlId="formTextInput">
              <Form.Label>Enter text or URL:</Form.Label>
              <Form.Control
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter text or URL"
              />
            </Form.Group>
            <Form.Group controlId="formQRCodeSize" className="mt-3">
              <Form.Label>QR Code Size (pixels):</Form.Label>
              <Form.Control
                type="number"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                placeholder="Enter size (e.g., 256)"
              />
            </Form.Group>
            <Button variant="primary" onClick={handleGenerate} className="mt-3">
              Generate QR Code
            </Button>
          </Form>
        </Col>{" "}
        {qrValue && (
          <Col md={12}>
            <div className="mt-4 text-center">
              <div ref={qrRef}>
                <QRCodeCanvas value={qrValue} size={size} />{" "}
                {/* Pass size as a prop */}
              </div>
              <Button
                variant="success"
                onClick={handleDownload}
                className="mt-3"
              >
                Download QR Code
              </Button>
              <p className="mt-3">Scan this QR code to view the content</p>
            </div>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default QRCodeGenerator;
