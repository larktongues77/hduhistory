import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { questions } from "@db/schema";
import { eq } from "drizzle-orm";

// ─── Question data (30 questions across 3 chapters) ───
const QUESTIONS_DATA = [
  { level: 1, chapter: 1, question: "杭州电子科技大学最初创建于哪一年？", optionA: "1949年", optionB: "1952年", optionC: "1956年", optionD: "1960年", correctAnswer: "C" as const, knowledgePoint: "1956年3月，杭州航空工业财经学校创建，这是杭电的起源。", year: 1956, difficulty: "easy" as const },
  { level: 2, chapter: 1, question: "学校创建时的初名是什么？", optionA: "杭州电子工业学院", optionB: "杭州航空工业财经学校", optionC: "浙江电机专科学校", optionD: "杭州电子科技大学", correctAnswer: "B" as const, knowledgePoint: "学校初名为杭州航空工业财经学校，隶属于第二机械工业部。", year: 1956, difficulty: "easy" as const },
  { level: 3, chapter: 1, question: "建校初期，学校最初隶属于哪个部门？", optionA: "第一机械工业部", optionB: "第二机械工业部", optionC: "浙江省教育厅", optionD: "电子工业部", correctAnswer: "B" as const, knowledgePoint: "1956年建校时，学校隶属于第二机械工业部（航空工业局）。", year: 1956, difficulty: "easy" as const },
  { level: 4, chapter: 1, question: "1958年6月，学校更名为什么？", optionA: "浙江电机专科学校", optionB: "杭州航空工业学校", optionC: "浙江机械工业学校", optionD: "杭州无线电工业学校", correctAnswer: "B" as const, knowledgePoint: "1958年6月，学校更名为杭州航空工业学校，改隶第一机械工业部。", year: 1958, difficulty: "medium" as const },
  { level: 5, chapter: 1, question: "1958年12月，学校下放至浙江省后更名为什么？", optionA: "杭州航空工业学校", optionB: "浙江机械工业学校", optionC: "浙江电机专科学校", optionD: "杭州无线电工业管理学校", correctAnswer: "C" as const, knowledgePoint: "1958年12月，学校下放至浙江省机械厅管理，更名为浙江电机专科学校。", year: 1958, difficulty: "medium" as const },
  { level: 6, chapter: 1, question: "1961年4月，学校再次更名为什么？", optionA: "浙江电机专科学校", optionB: "浙江机械工业学校", optionC: "杭州无线电工业学校", optionD: "杭州航空工业财经学校", correctAnswer: "B" as const, knowledgePoint: "1961年4月，学校更名为浙江机械工业学校。", year: 1961, difficulty: "medium" as const },
  { level: 7, chapter: 1, question: "1965年1月，学校更名为什么，并开始隶属第四机械工业部？", optionA: "杭州无线电工业学校", optionB: "杭州无线电工业管理学校", optionC: "学军机器厂", optionD: "浙江机械工业学校", correctAnswer: "B" as const, knowledgePoint: "1965年1月，学校更名为杭州无线电工业管理学校，隶属第四机械工业部。", year: 1965, difficulty: "medium" as const },
  { level: 8, chapter: 1, question: "文化大革命期间，学校曾于1970年改为什么名称？", optionA: "学军机器厂", optionB: "杭州无线电工业学校", optionC: "浙江电机厂", optionD: "杭州电子仪器厂", correctAnswer: "A" as const, knowledgePoint: "1970年2月，学校改为学军机器厂（国营学军机器厂，代号4509厂），实行厂校合一。", year: 1970, difficulty: "medium" as const },
  { level: 9, chapter: 1, question: "1973年5月，学校恢复办学时的校名是什么？", optionA: "杭州电子工业学院", optionB: "杭州无线电工业学校", optionC: "浙江机械工业学校", optionD: "杭州航空工业学校", correctAnswer: "B" as const, knowledgePoint: "1973年5月，学校恢复办学，定名为杭州无线电工业学校。", year: 1973, difficulty: "medium" as const },
  { level: 10, chapter: 1, question: "1973年复校后，学校的校址从哪里迁到了哪里？", optionA: "从西湖区迁至下沙", optionB: "从西湖区文三路迁至文一路", optionC: "从文一路迁至文三路", optionD: "从杭州市区迁至临安区", correctAnswer: "B" as const, knowledgePoint: "1973年复校时，学校从西湖区文三路迁至文一路。", year: 1973, difficulty: "hard" as const },

  { level: 11, chapter: 2, question: "1980年5月，学校经国务院批准改建为什么？", optionA: "杭州电子科技大学", optionB: "杭州电子工业学院", optionC: "杭州大学", optionD: "浙江工业大学", correctAnswer: "B" as const, knowledgePoint: "1980年5月，经国务院批准，学校改建为杭州电子工业学院，开始本科教育。", year: 1980, difficulty: "easy" as const },
  { level: 12, chapter: 2, question: "1980年改建为学院后，学校开始实行怎样的管理体制？", optionA: "浙江省单独管理", optionB: "第四机械工业部和浙江省双重领导，以部为主", optionC: "信息产业部直接管理", optionD: "国防科工委管理", correctAnswer: "B" as const, knowledgePoint: "1980年改建后，学校实行第四机械工业部、浙江省双重领导，以部为主的管理体制。", year: 1980, difficulty: "medium" as const },
  { level: 13, chapter: 2, question: "杭州电子工业学院时期，学校先后隶属过哪些部门？", optionA: "仅隶属电子工业部", optionB: "电子工业部、机械电子工业部、信息产业部等", optionC: "仅隶属浙江省", optionD: "仅隶属机械工业部", correctAnswer: "B" as const, knowledgePoint: "学院时期，学校先后隶属电子工业部、机械电子工业部、中国电子工业总公司、信息产业部等。", year: 1980, difficulty: "medium" as const },
  { level: 14, chapter: 2, question: "2000年，学校实行怎样的管理体制？", optionA: "完全由中央管理", optionB: "浙江省与信息产业部共建、以浙江省管理为主", optionC: "完全下放至杭州市", optionD: "由教育部直接管理", correctAnswer: "B" as const, knowledgePoint: "2000年，学校实行浙江省与信息产业部共建、以浙江省管理为主的办学管理体制。", year: 2000, difficulty: "easy" as const },
  { level: 15, chapter: 2, question: "2003年，哪所学校整体并入杭电？", optionA: "杭州师范学院", optionB: "杭州出版学校", optionC: "浙江工学院", optionD: "浙江财经学院", correctAnswer: "B" as const, knowledgePoint: "2003年，原杭州出版学校整体并入杭州电子工业学院。", year: 2003, difficulty: "easy" as const },
  { level: 16, chapter: 2, question: "2004年5月，学校正式更名为什么？", optionA: "杭州电子工业学院", optionB: "杭州电子科技大学", optionC: "浙江电子科技大学", optionD: "杭州信息工程大学", correctAnswer: "B" as const, knowledgePoint: "2004年5月，经教育部批准，杭州电子工业学院更名为杭州电子科技大学。", year: 2004, difficulty: "easy" as const },
  { level: 17, chapter: 2, question: "2004年更名后，杭电成为浙江省第几批省属重点建设高校？", optionA: "第一批", optionB: "第二批", optionC: "第三批", optionD: "第四批", correctAnswer: "A" as const, knowledgePoint: "2004年更名后，杭电被列为浙江省第一批省属重点建设高校。", year: 2004, difficulty: "medium" as const },
  { level: 18, chapter: 2, question: "杭州电子工业学院在哪一年获得硕士学位授予权？", optionA: "1980年", optionB: "1990年", optionC: "1996年", optionD: "2004年", correctAnswer: "C" as const, knowledgePoint: "1996年，学校获批硕士学位授予权。", year: 1996, difficulty: "hard" as const },
  { level: 19, chapter: 2, question: "杭电的主校区下沙校区位于杭州市哪个区？", optionA: "西湖区", optionB: "江干区（现钱塘区）", optionC: "余杭区", optionD: "滨江区", correctAnswer: "B" as const, knowledgePoint: "下沙校区位于杭州市江干区下沙高教园区（现属钱塘区），是学校的主校区。", year: 2000, difficulty: "easy" as const },
  { level: 20, chapter: 2, question: "2007年12月，学校成为浙江省与哪个机构的共建高校？", optionA: "教育部", optionB: "国防科学技术工业委员会", optionC: "信息产业部", optionD: "科技部", correctAnswer: "B" as const, knowledgePoint: "2007年12月，浙江省人民政府与国防科学技术工业委员会签署共建协议，杭电成为浙江省第一所与国防科工委共建的高校。", year: 2007, difficulty: "medium" as const },

  { level: 21, chapter: 3, question: "杭电的校训是什么？", optionA: "求是创新", optionB: "笃学力行、守正求新", optionC: "自强不息，厚德载物", optionD: "博学而笃志，切问而近思", correctAnswer: "B" as const, knowledgePoint: "杭电校训为'笃学力行、守正求新'，体现了学校重视实践、追求创新的办学理念。", year: 2004, difficulty: "easy" as const },
  { level: 22, chapter: 3, question: "杭电的优良传统是什么？", optionA: "团结勤奋、求实创新", optionB: "笃学力行、守正求新", optionC: "求是创新", optionD: "厚德博学、追求卓越", correctAnswer: "A" as const, knowledgePoint: "杭电秉承'团结勤奋、求实创新'的优良传统，弘扬'笃学力行、守正求新'的校训精神。", year: 2004, difficulty: "medium" as const },
  { level: 23, chapter: 3, question: "杭电现有多少个校区？", optionA: "3个", optionB: "4个", optionC: "5个", optionD: "6个", correctAnswer: "C" as const, knowledgePoint: "杭电现有5个校区：下沙（主校区）、文一、东岳、下沙东、青山湖。", year: 2024, difficulty: "easy" as const },
  { level: 24, chapter: 3, question: "以下哪个不是杭电的国家级特色专业？", optionA: "会计学", optionB: "计算机科学与技术", optionC: "机械设计制造及其自动化", optionD: "土木工程", correctAnswer: "D" as const, knowledgePoint: "杭电的国家级特色专业包括：软件工程、会计学、电子信息工程、信息安全、计算机科学与技术、电子科学与技术、通信工程。", year: 2024, difficulty: "medium" as const },
  { level: 25, chapter: 3, question: "杭电的国防特色重点专业是哪两个？", optionA: "计算机科学与技术、软件工程", optionB: "自动化、电子信息工程", optionC: "通信工程、信息安全", optionD: "会计学、管理科学", correctAnswer: "B" as const, knowledgePoint: "杭电是省属高校中唯一拥有国防特色重点专业的高校，国防特色重点专业为自动化和电子信息工程。", year: 2024, difficulty: "medium" as const },
  { level: 26, chapter: 3, question: "阿里巴巴创始人马云与杭电有什么关系？", optionA: "马云是杭电校友", optionB: "马云曾在杭电执教", optionC: "马云是杭电名誉校长", optionD: "马云捐赠了杭电图书馆", correctAnswer: "B" as const, knowledgePoint: "阿里巴巴创始人马云曾在杭州电子科技大学执教，阿里'十八罗汉'中有7位出自杭电。", year: 2024, difficulty: "easy" as const },
  { level: 27, chapter: 3, question: "杭电被誉为以下哪个称号？", optionA: "中国工程师的摇篮", optionB: "IT企业家摇篮", optionC: "金融界黄埔军校", optionD: "法律人才基地", correctAnswer: "B" as const, knowledgePoint: "杭电累计培养了20余万名IT领域人才和经管人才，全国IT百强企业中近1/3掌门人为杭电校友，被誉为'IT企业家摇篮'和'卓越会计师沃土'。", year: 2024, difficulty: "easy" as const },
  { level: 28, chapter: 3, question: "以下哪项是杭电进入全球ESI前1%的学科？", optionA: "法学", optionB: "医学", optionC: "工程学", optionD: "艺术学", correctAnswer: "C" as const, knowledgePoint: "杭电有5个学科进入全球ESI前1%：工程学、计算机科学、材料科学、化学、环境科学与生态学，其中工程学进入前1.5‰。", year: 2024, difficulty: "easy" as const },
  { level: 29, chapter: 3, question: "2015年，杭电被列为浙江省什么类型的高校？", optionA: "浙江省高水平大学建设高校", optionB: "浙江省重点建设高校", optionC: "国家'双一流'建设高校", optionD: "985工程高校", correctAnswer: "B" as const, knowledgePoint: "2015年，杭电被列为浙江省重点建设高校；2023年被列为浙江省高水平大学建设高校。", year: 2015, difficulty: "easy" as const },
  { level: 30, chapter: 3, question: "2026年是杭电建校多少周年？", optionA: "60周年", optionB: "65周年", optionC: "70周年", optionD: "75周年", correctAnswer: "C" as const, knowledgePoint: "1956年建校，2026年将迎来杭州电子科技大学70周年华诞。", year: 2026, difficulty: "easy" as const },
];

let seeded = false;

async function ensureQuestions() {
  if (seeded) return;
  const db = getDb();
  const existing = await db.select().from(questions);
  if (existing.length === 0) {
    for (const q of QUESTIONS_DATA) {
      await db.insert(questions).values(q);
    }
    console.log(`[Question Router] Seeded ${QUESTIONS_DATA.length} questions.`);
  }
  seeded = true;
}

export const questionRouter = createRouter({
  getByLevel: publicQuery
    .input(z.object({ level: z.number().min(1).max(30) }))
    .query(async ({ input }) => {
      await ensureQuestions();
      const db = getDb();
      const result = await db.select().from(questions).where(eq(questions.level, input.level));
      return result;
    }),

  listAll: publicQuery.query(async () => {
    await ensureQuestions();
    const db = getDb();
    const result = await db.select({
      id: questions.id,
      level: questions.level,
      chapter: questions.chapter,
      question: questions.question,
      optionA: questions.optionA,
      optionB: questions.optionB,
      optionC: questions.optionC,
      optionD: questions.optionD,
      difficulty: questions.difficulty,
    }).from(questions);
    return result;
  }),

  submitAnswer: publicQuery
    .input(z.object({
      questionId: z.number(),
      answer: z.enum(["A", "B", "C", "D"]),
    }))
    .mutation(async ({ input }) => {
      await ensureQuestions();
      const db = getDb();
      const result = await db.select().from(questions).where(eq(questions.id, input.questionId));
      if (result.length === 0) {
        return { correct: false, correctAnswer: "A" as const, knowledgePoint: "" };
      }
      const q = result[0];
      return {
        correct: q.correctAnswer === input.answer,
        correctAnswer: q.correctAnswer,
        knowledgePoint: q.knowledgePoint,
      };
    }),

  getChapters: publicQuery.query(async () => {
    return [
      { id: 1, title: "筚路蓝缕", range: "1956-1980", color: "#F5E6CC", levels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
      { id: 2, title: "茁壮成长", range: "1980-2004", color: "#D5F5E3", levels: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20] },
      { id: 3, title: "腾飞时代", range: "2004-至今", color: "#D6EAF8", levels: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30] },
    ];
  }),
});
