import { Student } from "../types/student";

export default function StudentCard({ student }: { student: Student }) {
    return (
        <div className="card">
            <h2 className="">{student.name}</h2>

            <div className="image-grid">
                {student.images.map((img, i) => (
                    <img 
                    key={i}
                    src={img} 
                    alt={student.name}
                    className="image-title"
                    />
                ))}
            </div>
        </div>
    )}