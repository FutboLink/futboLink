interface ProgressBarProps {
    progress: number;
  }
  
  const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
    return (
      <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
        <div
          className="bg-green-500 h-4 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
        <p className="text-sm text-gray-400 text-center mt-4">{progress}% Completado</p>
      </div>
    );
  };
  
  export default ProgressBar;
  