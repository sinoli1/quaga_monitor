import React, { useState } from 'react';
import { Ticket, Check } from 'lucide-react';

const FRESHDESK_URL = 'https://soporte.quaga.com/helpdesk/tickets/new';

interface TicketButtonProps {
  subject: string;
}

const TicketButton = ({ subject }: TicketButtonProps) => {
  const [copied, setCopied] = useState(false);

  const handleClick = () => {
    navigator.clipboard.writeText(subject).catch(() => {
      const el = document.createElement('textarea');
      el.value = subject;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    });
    setCopied(true);
    window.open(FRESHDESK_URL, '_blank', 'noopener,noreferrer');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <button className="card-ticket-btn" onClick={handleClick}>
      {copied ? <Check size={11} /> : <Ticket size={11} />}
      {copied ? 'Copiado' : 'Crear ticket'}
    </button>
  );
};

export default TicketButton;
