import { format } from "date-fns";
import { es } from "date-fns/locale";

interface SuccessBackupCardProps {
  clientName: string;
  status: string;
  sentDate: string;
}

const formatSuccessDate = (dateString: string) => {
    try {
        const date = new Date(dateString);
        return format(date, "dd/MM HH:mm", { locale: es });
    } catch {
        return dateString;
    }
}

const SuccessBackupCard = ({ clientName, status, sentDate }: SuccessBackupCardProps) => {
  return (
    <div className="card" style={{ borderColor: 'rgba(95, 211, 159, 0.3)' }}>
      <div className="card-head">
        <div className="card-identity">
          <div className="avatar" style={{ background: 'linear-gradient(135deg, #5fd39f 0%, #3e9a72 100%)', boxShadow: 'none', color: '#fff' }}>
            {clientName.substring(0, 2).toUpperCase()}
          </div>
          <div className="card-name">
            <div className="card-title">{clientName.toUpperCase()}</div>
            <div className="card-subtitle" style={{ color: '#5fd39f' }}>{status}</div>
          </div>
        </div>
        <div className="card-badge" style={{ background: 'transparent', border: '1px solid rgba(95, 211, 159, 0.2)', color: '#5fd39f' }}>
          {formatSuccessDate(sentDate)}
        </div>
      </div>
    </div>
  );
};

export default SuccessBackupCard;