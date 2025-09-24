export const numberWithCommas = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


// export const numberWithCommas=(x)=> {
//   if (x === undefined || x === null) return 0;
//   return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
// }