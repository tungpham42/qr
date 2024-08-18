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
    if (!qrRef.current) return;

    cropToQRContent(qrRef.current)
      .then((croppedCanvas) => {
        croppedCanvas.toBlob((blob) => {
          const link = document.createElement("a");
          link.download = `qr-code-${size}.png`;
          link.href = URL.createObjectURL(blob);
          link.click();
        });
      })
      .catch((err) => console.error("Error generating image:", err));
  };

  const cropToQRContent = (canvasContainer) => {
    return new Promise((resolve, reject) => {
      toPng(canvasContainer)
        .then((dataUrl) => {
          const image = new Image();
          image.src = dataUrl;
          image.onload = () => {
            const trimmedCanvas = document.createElement("canvas");
            const context = trimmedCanvas.getContext("2d");

            const { width, height } = image;
            trimmedCanvas.width = width;
            trimmedCanvas.height = height;

            context.drawImage(image, 0, 0);
            const imageData = context.getImageData(0, 0, width, height);
            const trimmedData = trimCanvas(imageData);

            trimmedCanvas.width = trimmedData.width;
            trimmedCanvas.height = trimmedData.height;
            context.putImageData(trimmedData, 0, 0);

            resolve(trimmedCanvas);
          };
        })
        .catch((err) => reject(err));
    });
  };

  const trimCanvas = (imageData) => {
    const { data, width, height } = imageData;
    let top = 0,
      bottom = height,
      left = 0,
      right = width;

    // Find top boundary
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const alpha = data[(y * width + x) * 4 + 3];
        if (alpha > 0) {
          top = y;
          break;
        }
      }
      if (top !== 0) break;
    }

    // Find bottom boundary
    for (let y = height - 1; y >= 0; y--) {
      for (let x = 0; x < width; x++) {
        const alpha = data[(y * width + x) * 4 + 3];
        if (alpha > 0) {
          bottom = y + 1;
          break;
        }
      }
      if (bottom !== height) break;
    }

    // Find left boundary
    for (let x = 0; x < width; x++) {
      for (let y = top; y < bottom; y++) {
        const alpha = data[(y * width + x) * 4 + 3];
        if (alpha > 0) {
          left = x;
          break;
        }
      }
      if (left !== 0) break;
    }

    // Find right boundary
    for (let x = width - 1; x >= 0; x--) {
      for (let y = top; y < bottom; y++) {
        const alpha = data[(y * width + x) * 4 + 3];
        if (alpha > 0) {
          right = x + 1;
          break;
        }
      }
      if (right !== width) break;
    }

    const trimmedWidth = right - left;
    const trimmedHeight = bottom - top;
    const trimmedData = new ImageData(trimmedWidth, trimmedHeight);

    for (let y = 0; y < trimmedHeight; y++) {
      for (let x = 0; x < trimmedWidth; x++) {
        const srcIndex = ((top + y) * width + (left + x)) * 4;
        const destIndex = (y * trimmedWidth + x) * 4;
        trimmedData.data[destIndex] = data[srcIndex];
        trimmedData.data[destIndex + 1] = data[srcIndex + 1];
        trimmedData.data[destIndex + 2] = data[srcIndex + 2];
        trimmedData.data[destIndex + 3] = data[srcIndex + 3];
      }
    }

    return trimmedData;
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
        </Col>
        {qrValue && (
          <Col md={12}>
            <div className="mt-4 text-center">
              <div ref={qrRef}>
                <QRCodeCanvas value={qrValue} size={size} />
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
