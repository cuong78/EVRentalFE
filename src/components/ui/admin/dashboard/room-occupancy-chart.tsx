import type { RoomOccupancyReport } from "../../../../types/dashboard"

export const RoomOccupancyChart = ({ data }: { data: RoomOccupancyReport }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-1">Tỷ Lệ Lấp Đầy Theo Phòng</h3>
            <p className="text-sm text-gray-500 mb-4">Tình trạng sử dụng ghế theo từng phòng chiếu</p>
            <div className="space-y-3">
                {data?.occupancyRate.roomDetails?.map((room, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{`${room.roomName} (${room.screenType})`}</p>
                            <p className="text-xs text-gray-500">{room.occupancyRate} ghế</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all duration-300 ${room.occupancyRate > 90 ? 'bg-green-500' :
                                        room.occupancyRate > 70 ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}
                                    style={{ width: `${room.occupancyRate}%` }}
                                />
                            </div>
                            <span className="text-sm font-medium text-gray-900 w-12">{room.occupancyRate}%</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )


}