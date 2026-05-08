import React from 'react';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Printer } from 'lucide-react';

const BillButton = ({ appointmentId }) => {
    const { backendUrl, token } = useContext(AppContext);

    const handleDownload = async () => {
        try {
            const response = await axios({
                url: `${backendUrl}/api/user/generate-bill/${appointmentId}`,
                method: 'GET',
                responseType: 'blob',
                headers: { token }
            });

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `bill-${appointmentId}.pdf`);
            
            // Append to html link element page
            document.body.appendChild(link);
            
            // Start download
            link.click();
            
            // Clean up and remove the link
            link.parentNode.removeChild(link);
            toast.success('Bill downloaded successfully');
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to download bill');
        }
    };

    return (
        <button 
            onClick={handleDownload}
            className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
        >
            <Printer size={16} />
            Download Bill
        </button>
    );
};

export default BillButton;