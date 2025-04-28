import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { scenariosId: string } }
) {
  try {
    const supabase = await createClient();
    const { scenariosId } = await params;

    const user = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("scenarios")
      .select("*")
      .eq("id", scenariosId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Scenario not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (data.user_id !== user.data.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching scenario:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { scenariosId: string } }
) {
  try {
    const supabase = await createClient();
    const { scenariosId } = await params;
    const user = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { data: scenario, error: fetchError } = await supabase
      .from("scenarios")
      .select("user_id, is_custom")
      .eq("id", scenariosId)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json(
          { error: "Scenario not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (scenario.user_id !== user.data.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (!scenario.is_custom) {
      return NextResponse.json(
        { error: "Cannot delete default scenarios" },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from("scenarios")
      .delete()
      .eq("id", scenariosId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting scenario:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { scenariosId: string } }
) {
  try {
    const supabase = await createClient();
    const { scenariosId } = await params;

    const user = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { data: scenario, error: fetchError } = await supabase
      .from("scenarios")
      .select("user_id")
      .eq("id", scenariosId)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json(
          { error: "Scenario not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (scenario.user_id !== user.data.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();

    const { data, error } = await supabase
      .from("scenarios")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", scenariosId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating scenario:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
