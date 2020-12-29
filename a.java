public class a {

  a() {
    System.out.println("Constructor 1 executed");
  }

  a(int a) {
    System.out.println("Constructor 2 executed");
  }

  a(int a, int b) {
    System.out.println("Constructor 3 executed");
  }
  // void Area(int a) {
  //   System.out.println("Function 1 executed");
  // }

  // void Area(double a) {
  //   System.out.println("Function 2 executed");
  // }

  // void Area(int a, int b) {
  //   System.out.println("Function 3 executed");
  // }

  // // void Area(double a, int b) {
  // //   System.out.println("Function 4 executed");
  // // }

  // void Area(int a, double b) {
  //   System.out.println("Function 5 executed");
  // }

  // void Area(double a, double b) {
  //   System.out.println("Function 6 executed");
  // }

  public static void main(String[] args) {
    a ob1 = new a();
    // a ob2 = new a(10);
    a ob3 = new a(10, 20);

  }
}

// 1. same number hai yaa nahi
// 2. same datatype hai yaa nahi
// 3. bada datatype hai yaa nahi
