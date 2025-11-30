import imgRestaurant from "figma:asset/3d52c25ee6bf557c13ef2bcaeff5482574bb4c45.png";
import imgHome from "figma:asset/bba75553c62dc1fd24da6f9bdb9abb9fedc2cdd9.png";

export default function Logo1() {
  return (
    <div className="relative w-full h-full rounded-[20px] bg-gradient-to-b from-[#a0c878] to-[#ddeb9d] overflow-hidden">
      {/* Background overlay */}
      <div className="absolute inset-0 flex items-center justify-center p-[14%]">
        <div className="relative w-full h-full">
          {/* Home icon - larger background */}
          <div className="absolute inset-0 flex items-center justify-center">
            <img 
              alt="Home" 
              className="w-[70%] h-[70%] object-contain brightness-0 invert" 
              src={imgHome} 
            />
          </div>
          {/* Restaurant icon - smaller foreground */}
          <div className="absolute inset-0 flex items-center justify-center">
            <img 
              alt="Restaurant" 
              className="w-[30%] h-[30%] object-contain brightness-0 invert" 
              src={imgRestaurant} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}