defmodule SiteBackend.ErrorMessages do
  @moduledoc """
  Ecto changeset 에러를 한국어로 변환합니다.
  """

  @field_names %{
    email: "이메일",
    password: "비밀번호",
    name: "이름",
    account_type: "계정 유형",
    title: "제목",
    description: "설명",
    category: "카테고리",
    skills: "기술 스택",
    price: "가격",
    delivery_days: "납품 기간",
    thumbnail_url: "썸네일 URL",
    is_active: "활성화",
    requirements: "요구 사항",
    status: "상태",
    message: "메시지",
    content: "내용",
    client_id: "클라이언트 ID",
    freelancer_id: "프리랜서 ID",
    service_id: "서비스 ID",
    service_order_id: "주문 ID",
    project_id: "프로젝트 ID",
    chat_room_id: "채팅방 ID",
    sender_id: "보내는 사람 ID",
    user_id: "사용자 ID"
  }

  @type_messages %{
    "has already been taken" => "이미 사용 중입니다",
    "can't be blank" => "을(를) 입력해주세요",
    "is invalid" => "형식이 올바르지 않습니다",
    "is not a number" => "숫자여야 합니다",
    "must be greater than %{count}" => "%{count}보다 커야 합니다",
    "does not match confirmation" => "일치하지 않습니다",
    "should be at least %{count} character(s)" => "최소 %{count}자 이상이어야 합니다",
    "should be at most %{count} character(s)" => "최대 %{count}자여야 합니다",
    "has already been taken for this project" => "이미 해당 프로젝트에 지원하셨습니다"
  }

  @doc """
  필드명을 한국어로 변환합니다.
  """
  def translate_field(field) when is_binary(field) do
    String.to_existing_atom(field)
    |> translate_field()
  end

  def translate_field(field) when is_atom(field) do
    @field_names[field] || to_string(field)
  end

  def translate_changeset_errors(changeset) do
    Ecto.Changeset.traverse_errors(changeset, fn {msg, opts} ->
      msg = translate_message(msg)

      Enum.reduce(opts, msg, fn {key, value}, acc ->
        case key do
          :count ->
            String.replace(acc, "%{count}", to_string(value))

          :type ->
            String.replace(acc, "%{type}", to_string(value))

          _ ->
            acc
        end
      end)
    end)
    |> Enum.map(fn {field, errors} ->
      field_kr = @field_names[field] || to_string(field)
      error_msg = Enum.join(errors, ", ")
      # 에러 메시지에 이미 필드명이 포함되어 있으면 중복 추가하지 않음
      if String.starts_with?(error_msg, field_kr) do
        error_msg
      else
        "#{field_kr}#{error_msg}"
      end
    end)
    |> Enum.join("\n")
  end

  defp translate_message(msg) do
    case msg do
      "can't be blank" -> "이(가) 비어 있습니다"
      "has already been taken" -> "이(가) 이미 사용 중입니다"
      "is invalid" -> "이(가) 형식이 올바르지 않습니다"
      "is required" -> "이(가) 필수입니다"
      _ ->
        @type_messages[msg] || msg
    end
  end
end
