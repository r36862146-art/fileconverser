
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import MergePdf from './pages/MergePdf';
import SplitPdf from './pages/SplitPdf';
import CompressPdf from './pages/CompressPdf';
import ReorderPdf from './pages/ReorderPdf';
import PdfEditor from './pages/PdfEditor';
import RotatePdf from './pages/RotatePdf';
import Guide from './pages/Guide';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/pdf-editor" element={<PdfEditor />} />
          <Route path="/merge-pdf" element={<MergePdf />} />
          <Route path="/split-pdf" element={<SplitPdf />} />
          <Route path="/compress-pdf" element={<CompressPdf />} />
          <Route path="/reorder-pdf" element={<ReorderPdf />} />
          <Route path="/rotate-pdf" element={<RotatePdf />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
