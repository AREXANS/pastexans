import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, appId } from "@/lib/firebase";
import { simpleObfuscator } from "@/lib/obfuscator";
import { Icon } from "./Icon";

interface RawViewerProps {
  scriptId: string;
}

export const RawViewer = ({ scriptId }: RawViewerProps) => {
  const [content, setContent] = useState("Initializing stream...");
  const [isExpired, setIsExpired] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  useEffect(() => {
    document.body.style.background = '#0d1117';
    document.body.style.color = '#c9d1d9';
    document.body.style.fontFamily = "'JetBrains Mono', monospace";
    document.body.style.padding = '0';
    document.body.style.margin = '0';
    document.body.style.overflow = 'auto';

    const checkAndFetch = async () => {
      try {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'scripts', scriptId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setContent("404: Payload Not Found");
          return;
        }
        const data = docSnap.data();

        if (data.deleted) {
          setIsDeleted(true);
          setContent("SCRIPT_DELETED");
          return;
        }

        if (data.expiresAt) {
          const now = new Date();
          const expiry = data.expiresAt.toDate();
          if (now > expiry) {
            setIsExpired(true);
            setContent("EXPIRED_PAYLOAD");
            return;
          }
        }

        if (data.obfuscate) {
          setContent(simpleObfuscator(data.content, data.obfuscateLevel || 1));
        } else {
          setContent(data.content);
        }
      } catch (err) {
        setContent("Error fetching payload: " + (err as Error).message);
      }
    };

    checkAndFetch();
  }, [scriptId]);

  if (isExpired) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center" style={{ background: '#0d1117', fontFamily: "'JetBrains Mono', monospace" }}>
        <div className="w-20 h-20 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mb-6">
          <Icon name="clock-8" size={40} className="text-red-500"/>
        </div>
        <h1 className="text-3xl font-bold text-red-500 mb-2">PAYLOAD EXPIRED</h1>
        <p className="text-gray-500 max-w-md">This script has exceeded its configured lifetime and is no longer accessible.</p>
        <div className="mt-6 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
          ERROR_CODE: TIMEOUT_REACHED
        </div>
      </div>
    );
  }

  if (isDeleted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center" style={{ background: '#0d1117', fontFamily: "'JetBrains Mono', monospace" }}>
        <div className="w-20 h-20 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center mb-6">
          <Icon name="trash-2" size={40} className="text-orange-500"/>
        </div>
        <h1 className="text-3xl font-bold text-orange-500 mb-2">PAYLOAD DELETED</h1>
        <p className="text-gray-500 max-w-md">This script has been removed by its owner or an administrator.</p>
        <div className="mt-6 px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded text-orange-400 text-sm">
          ERROR_CODE: RESOURCE_GONE
        </div>
      </div>
    );
  }

  return (
    <pre
      style={{
        background: '#0d1117',
        color: '#c9d1d9',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '12px',
        lineHeight: '1.5',
        padding: '16px',
        margin: 0,
        minHeight: '100vh',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
        overflowX: 'hidden'
      }}
    >
      {content}
    </pre>
  );
};
