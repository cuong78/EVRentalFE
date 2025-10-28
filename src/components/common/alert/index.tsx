
import swal from 'sweetalert';


//show Alert
const Alert = (title: string, icon: "success" | "error" | "warning") => {
    return swal(title, { icon });
};


export default Alert;
