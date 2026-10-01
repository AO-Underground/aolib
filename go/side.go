package aolib

// IsFullView reports whether s is a full-view position (def, pro or wit),
// whose layout uses the panning camera.
func IsFullView(s Side) bool { return s == SideDef || s == SidePro || s == SideWit }
