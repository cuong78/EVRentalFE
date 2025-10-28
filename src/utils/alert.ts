
import swal from 'sweetalert';

//show Alert
export const Alert = (title: string, icon: "success" | "error" | "warning") => {
    return swal(title, { icon });
};

export const showCancelConfirm = () => {
    return Alert("Hủy thao tác thành công", "success");
}


export const showConfirmDelete = (title: string, text: string) => {
    return swal({
        title,
        text,
        icon: "warning",
        buttons: {
            cancel: {text: "Hủy", visible: true, closeModal: true},
            confirm: {text: "Xóa", visible: true, closeModal: true},
        },
        dangerMode: true,
    });
};

export const showConfirmRestore = (title: string, text: string) => {
    return swal({
        title,
        text,
        icon: "warning",
        buttons: {
            cancel: {text: "Hủy", visible: true, closeModal: true},
            confirm: {text: "Xác nhận", visible: true, closeModal: true},
        },
    });
};


