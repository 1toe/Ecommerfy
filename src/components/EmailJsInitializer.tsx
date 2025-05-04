import { useEffect } from 'react';
import emailjs from '@emailjs/browser';

interface EmailJsInitializerProps {
  publicKey: string;
}

const EmailJsInitializer = ({ publicKey }: EmailJsInitializerProps) => {
  useEffect(() => {
    if (publicKey) {
      emailjs.init(publicKey);
      console.log('EmailJS initialized');
    } else {
      console.warn('EmailJS initialization failed: No public key provided');
    }
  }, [publicKey]);

  return null;
};

export default EmailJsInitializer;
